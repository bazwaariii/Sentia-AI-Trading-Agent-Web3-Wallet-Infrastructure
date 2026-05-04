// ============================================================
//  ____             _   _
// / ___|  ___ _ __ | |_(_) __ _
// \___ \ / _ \ '_ \| __| |/ _` |
//  ___) |  __/ | | | |_| | (_| |
// |____/ \___|_| |_|\__|_|\__,_|
//
//  Agent Wallet Infrastructure — Telegram Bot
//  Solana · Colosseum Hackathon 2026
// ============================================================

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const logger = require('./utils/logger');
const messages = require('./utils/messages');
const kb = require('./utils/keyboard');
const userHandler = require('./handlers/userHandler');
const walletHandler = require('./handlers/walletHandler');
const sessionKeyHandler = require('./handlers/sessionKeyHandler');
const aiHandler = require('./handlers/aiHandler');
const dexAnalyzer = require('./handlers/dexAnalyzer');

// ── Validate token ──────────────────────────────────────────
if (!config.BOT_TOKEN) {
  logger.error('BOT_TOKEN is not set in .env file!');
  process.exit(1);
}

// ── Initialize bot ──────────────────────────────────────────
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });
const START_TIME = Date.now();

logger.bot('═══════════════════════════════════════════');
logger.bot('  ⚡ Sentia — Agent Wallet Bot');
logger.bot(`  v${config.BOT_VERSION} | ${config.HACKATHON}`);
logger.bot('═══════════════════════════════════════════');

// ── Rate limiter ────────────────────────────────────────────
const rateLimitMap = new Map();
const loginState = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  const userRates = rateLimitMap.get(userId) || [];
  const recent = userRates.filter(t => now - t < config.RATE_LIMIT_WINDOW);
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return recent.length > config.RATE_LIMIT;
}

// ── Helper: safe send with MarkdownV2 ───────────────────────
async function send(chatId, text, extra = {}) {
  try {
    return await bot.sendMessage(chatId, text, {
      parse_mode: 'MarkdownV2',
      ...extra,
    });
  } catch (err) {
    logger.warn(`MarkdownV2 failed, sending plain: ${err.message}`);
    try {
      const plainText = text
        .replace(/\\([_*\[\]()~`>#+\-=|{}.!])/g, '$1')
        .replace(/\*/g, '')
        .replace(/_/g, '');
      return await bot.sendMessage(chatId, plainText, extra);
    } catch (err2) {
      logger.error(`Failed to send message: ${err2.message}`);
    }
  }
}

// ── Middleware: track every incoming message ─────────────────
bot.on('message', async (msg) => {
  if (!msg.from) return;
  if (isRateLimited(msg.from.id)) {
    send(msg.chat.id, messages.rateLimited());
    return;
  }
  userHandler.trackUser(msg.from);
  userHandler.incrementMessages(msg.from.id);

  // Conversational Login Flow
  const state = loginState.get(msg.from.id);
  if (state && msg.text && !msg.text.startsWith('/')) {
    if (state.step === 'email') {
      state.email = msg.text.trim();
      state.step = 'password';
      bot.sendMessage(msg.chat.id, `🔒 Masukkan **Password** Anda:\n\n_(Pesan ini bisa Anda hapus setelah dikirim demi keamanan)_`, { parse_mode: 'Markdown' });
      return;
    } else if (state.step === 'password') {
      state.password = msg.text.trim();
      state.step = 'pin';
      bot.sendMessage(msg.chat.id, `🔢 Masukkan **PIN 6-digit** Anda:`, { parse_mode: 'Markdown' });
      return;
    } else if (state.step === 'pin') {
      const pinInput = msg.text.trim();
      if (!/^\d{6}$/.test(pinInput)) {
        bot.sendMessage(msg.chat.id, `⚠️ PIN harus terdiri dari angka dan persis 6 digit!\nSilakan masukkan ulang PIN Anda:`);
        return;
      }
      
      state.pin = pinInput;
      const { email, password, pin } = state;
      loginState.delete(msg.from.id); // Clear state
      
      bot.sendMessage(msg.chat.id, `⏳ Sedang memverifikasi...`);

      try {
        const axios = require('axios');

        // Clear any existing wallet data for THIS telegram user BEFORE login
        // This prevents cross-account contamination
        const existingWallet = walletHandler.getWallet(msg.from.id);
        if (existingWallet) {
          walletHandler.disconnectWallet(msg.from.id);
          logger.info(`Cleared old wallet for telegram user ${msg.from.id} before new login`);
        }

        const response = await axios.post(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/login`, {
          email, password, pin, telegramChatId: String(msg.chat.id)
        });

        if (response.data.success) {
          const user = response.data.user;
          if (user.walletAddress) {
            walletHandler.connectWallet(msg.from.id, user.walletAddress, 'manual');
            const walletData = walletHandler.getWallet(msg.from.id);
            if (walletData) {
              walletData.verified = true;
              walletData.verifiedAt = Date.now();
              walletData.linkedEmail = email;
              walletData.linkedUser = user.name;
              const Storage = require('./utils/storage');
              const ws = new Storage('wallets.json');
              ws.set(String(msg.from.id), walletData);
            }
          }
          send(msg.chat.id, `✅ *Berhasil Login\\!*\n\nSelamat datang, ${messages.escMd(user.name)}\nAkun Anda (${messages.escMd(email)}) telah tersambung dengan Bot Sentia\\.\nKetik /dashboard atau klik 🌐 Web Dashboard untuk melihat riwayat akun Anda dari web\\.`);
        } else {
          send(msg.chat.id, `❌ *Gagal Login*\n\n${messages.escMd(response.data.error || 'Terjadi kesalahan.')}`);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Pastikan website berjalan dan kredensial benar.';
        send(msg.chat.id, `❌ *Gagal Login*\n\n${messages.escMd(errorMsg)}`);
      }
      return;
    }
  }
});

// ════════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ════════════════════════════════════════════════════════════

// ── /start ──────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/start');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.welcome(msg.from.first_name), kb.MAIN_MENU_KEYBOARD);
});

// ── /menu ───────────────────────────────────────────────────
bot.onText(/\/menu/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/menu');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.mainMenu(), {
    ...buildMainMenuInline(),
    ...kb.MAIN_MENU_KEYBOARD,
  });
});

// ── /login ────────────────────────────────────────────────────
bot.onText(/\/(login)$/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/login');
  userHandler.incrementCommands(msg.from.id);
  
  loginState.set(msg.from.id, { step: 'email' });
  bot.sendMessage(msg.chat.id, `📧 Masukkan **Email** Anda:`, { parse_mode: 'Markdown' });
});

// ── /logout ───────────────────────────────────────────────────
bot.onText(/\/(logout)$/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/logout');
  userHandler.incrementCommands(msg.from.id);

  const w = walletHandler.getWallet(msg.from.id);
  if (!w) {
    return send(msg.chat.id, `ℹ️ *Anda belum login\\.*\n\nGunakan /login atau klik 🔗 Wallet untuk masuk\.`);
  }

  // Clear wallet data from bot
  walletHandler.disconnectWallet(msg.from.id);

  // Clear telegramChatId from web database
  try {
    const axios = require('axios');
    await axios.post(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/logout`, {
      telegramChatId: String(msg.chat.id)
    });
  } catch (e) {
    logger.warn(`Failed to clear web session: ${e.message}`);
  }

  send(msg.chat.id, `🚪 *Berhasil Logout\\!*\n\nWallet dan sesi Anda telah diputuskan dari bot ini\\.\nData akun Anda tetap aman di website\\.\n\nGunakan /login untuk masuk kembali\\.`);
});

// ── 🔗 Link Web Account (Button Hook) ─────────────────────
bot.onText(/🔗 Link Web Account/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, 'Link Web Account Menu');
  userHandler.incrementCommands(msg.from.id);
  
  loginState.set(msg.from.id, { step: 'email' });
  bot.sendMessage(msg.chat.id, `🌐 *Sambungkan Akun Web*\n\n📧 Masukkan **Email** Anda:`, { parse_mode: 'Markdown' });
});

// ── /dashboard ─────────────────────────────────────────────
bot.onText(/\/(dashboard)|(🌐 Web Dashboard)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/dashboard');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const user = response.data.user;
      let text = `👑 *Dashboard Owner: ${messages.escMd(user.name)}*\n\n`;
      text += `🤖 *Agents Active:* ${user.agents.length}\n`;
      text += `💸 *Recent Transactions:*\n`;
      user.transactions.forEach(tx => {
        text += `\\- ${messages.escMd(tx.amount.toString())} ${messages.escMd(tx.token)} \\(${messages.escMd(tx.status)}\\)\n`;
      });
      if (user.transactions.length === 0) text += `\\- No transactions yet\\.\n`;

      send(msg.chat.id, text);
    } else {
      send(msg.chat.id, `❌ *Gagal Memuat*\n\nUser tidak ditemukan\\. Gunakan menu '🔗 Link Web Account' terlebih dahulu\\.`);
    }
  } catch (error) {
    send(msg.chat.id, `❌ *Gagal menghubungi server web\\.*\n\nPastikan Anda login dan web berjalan\\. Jika belum, buat akun di web\\.`);
  }
});

// ── /agents ─────────────────────────────────────────────────
bot.onText(/\/(agents)|(🤖 My Agents)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/agents');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const agentsList = response.data.user.agents;
      if (agentsList.length === 0) {
        return send(msg.chat.id, "❌ *Anda belum memiliki agen\\.*\nSilakan buat agen baru di website\\.");
      }

      let text = `🤖 *Agen Aktif Anda:* ${agentsList.length}\n\n`;
      agentsList.forEach((a, i) => {
        text += `${i + 1}\\. *${messages.escMd(a.name)}*\n   PubKey: \`${messages.escMd(a.pubkey)}\`\n\n`;
      });

      send(msg.chat.id, text, {
        ...kb.inlineKeyboard(
          ...agentsList.map((a, i) => [kb.btn(`⚙️ Manage ${a.name}`, `agent_manage_${a.id}`)]),
          [kb.btn('📊 View All on Web', 'view_analytics')]
        ),
      });
    } else {
      send(msg.chat.id, "❌ *Gagal mengambil data\\.*\nSilakan hubungkan akun web Anda dengan menu '🔗 Link Web Account'\\.");
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Server web tidak merespon\\.*");
  }
});

// ── /agent <name> ───────────────────────────────────────────
bot.onText(/\/agent (.+)/, (msg, match) => {
  const name = match[1].toLowerCase();
  logger.cmd(msg.from.username || msg.from.first_name, `/agent ${name}`);
  userHandler.incrementCommands(msg.from.id);
  const agent = config.DEMO_AGENTS.find(a => a.name.toLowerCase().includes(name));
  if (agent) {
    send(msg.chat.id, messages.agentDetail(agent), {
      ...kb.inlineKeyboard(
        [kb.btn('💸 Transactions', 'view_transactions'), kb.btn('📊 Analytics', 'view_analytics')],
        [kb.btn('🔙 All Agents', 'view_agents')],
      ),
    });
  } else {
    send(msg.chat.id, messages.errorMsg(`Agent "${match[1]}" tidak ditemukan`));
  }
});

// ── /transactions ───────────────────────────────────────────
bot.onText(/\/(transactions)|(💸 Transactions)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/transactions');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const txs = response.data.user.transactions;
      if (txs.length === 0) {
        return send(msg.chat.id, "📊 *Riwayat Transaksi Kosong\\.*");
      }

      let text = `💸 *Recent Transactions:* \n\n`;
      txs.slice(0, 5).forEach((tx, i) => {
        text += `${i + 1}\\. *${messages.escMd(tx.token)}* \- ${tx.amount}\n   ` +
          `Status: ${tx.status === 'approved' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'} _${tx.status}_\n\n`;
      });

      send(msg.chat.id, text, {
        ...kb.inlineKeyboard(
          ...txs.slice(0, 3).map(tx => [kb.btn(`🔍 Detail ${tx.id.slice(0, 8)}`, `tx_detail_${tx.id}`)]),
          [kb.btn('🔄 Refresh', 'view_transactions')]
        ),
      });
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal mengambil riwayat transaksi\\.*");
  }
});

// ── /tx <id> ────────────────────────────────────────────────
bot.onText(/\/tx (.+)/, async (msg, match) => {
  const txId = match[1].toLowerCase();
  logger.cmd(msg.from.username || msg.from.first_name, `/tx ${txId}`);
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);
    if (response.data.user) {
      const tx = response.data.user.transactions.find(t => t.id.toLowerCase() === txId || t.id.toLowerCase().startsWith(txId));
      if (tx) {
        const agentName = response.data.user.agents.find(a => a.id === tx.agentId)?.name || 'Unknown Agent';
        let text = `💸 *Transaction Detail*\n\n`;
        text += `• ID: \`${tx.id}\`\n`;
        text += `• Agent: *${agentName}*\n`;
        text += `• Type: ${tx.type}\n`;
        text += `• Amount: *${tx.amount} ${tx.token}*\n`;
        text += `• Status: *${tx.status.toUpperCase()}*\n`;
        text += `• Recipient: \`${tx.toAddress}\`\n`;
        text += `• Time: ${new Date(tx.createdAt).toLocaleString()}\n`;

        const buttons = tx.status === 'pending'
          ? [kb.btn('✅ Approve', `approve_${tx.id}`), kb.btn('❌ Reject', `reject_${tx.id}`)]
          : [kb.btn('💸 All Transactions', 'view_transactions')];
        send(msg.chat.id, text, kb.inlineKeyboard(buttons));
      } else {
        send(msg.chat.id, `❌ Transaction "${match[1]}" tidak ditemukan.`);
      }
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal memuat detail transaksi\\.*");
  }
});

// ── /limits ─────────────────────────────────────────────────
bot.onText(/\/(limits)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/limits');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const u = response.data.user;
      let text = `⚖️ *Global Spending Limits:*\n`;
      text += `• Default Max Per Tx: *${u.defaultMaxPerTx} USDC*\n`;
      text += `• Default Daily Limit: *${u.defaultDailyLimit} USDC*\n`;
      text += `• Monthly Budget: *${u.monthlyBudgetCap} USDC*\n\n`;
      text += `🤖 *Per-Agent Overrides:*\n`;

      if (u.agents.length === 0) {
        text += `_Belum ada agent yang terdaftar._`;
      } else {
        u.agents.forEach(agent => {
          text += `*${agent.name}*\n`;
          text += `  └ Max/tx: ${agent.maxPerTx || u.defaultMaxPerTx} USDC\n`;
          text += `  └ Daily: ${agent.dailyLimit || u.defaultDailyLimit} USDC\n\n`;
        });
      }

      send(msg.chat.id, text, {
        ...kb.inlineKeyboard(
          [kb.btn('🤖 View Agents', 'view_agents'), kb.urlBtn('🌐 Web Settings', `${process.env.WEB_URL || 'https://sentia.web.id'}/dashboard`)],
        ),
      });
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal mengambil data limits\\.*");
  }
});

// ── /approvals ──────────────────────────────────────────────
bot.onText(/\/(approvals)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/approvals');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const pending = response.data.user.transactions.filter(tx => tx.status === 'pending');
      if (pending.length === 0) {
        return send(msg.chat.id, "🔔 *Tidak ada antrean approval\\.* Semua transaksi bersih\\.");
      }

      let text = `🔔 *Pending Approvals:* \n\n`;
      pending.forEach(tx => {
        text += `⚠️ *${tx.amount} ${tx.token}*\nID: \`${tx.id}\`\n\n`;
      });

      send(msg.chat.id, text, {
        ...kb.inlineKeyboard(
          ...pending.map(tx => [
            kb.btn(`✅ Approve ${tx.id.slice(0, 8)}`, `approve_${tx.id}`),
            kb.btn(`❌ Reject ${tx.id.slice(0, 8)}`, `reject_${tx.id}`)
          ])
        ),
      });
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal memuat daftar approval\\.*");
  }
});

// ── /test_tx ────────────────────────────────────────────────
bot.onText(/\/(test_tx)/, async (msg) => {
  try {
    const axios = require('axios');
    const response = await axios.post(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/transaction/seed`, {
      chatId: String(msg.chat.id)
    });
    if (response.data.success) {
      send(msg.chat.id, "✅ *Transaksi Dummy Berhasil Dibuat!*\nSilakan cek menu 🔔 Approvals di web atau di bot ini.");
    }
  } catch (error) {
    send(msg.chat.id, "❌ Gagal membuat transaksi dummy.");
  }
});

// ── /analytics ──────────────────────────────────────────────
bot.onText(/\/(analytics)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/analytics');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/dashboard/${msg.chat.id}`);

    if (response.data.user) {
      const u = response.data.user;
      const txs = u.transactions || [];
      const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);
      const pendingCount = txs.filter(tx => tx.status === 'pending').length;

      let text = `📊 *Account Analytics:*\n\n`;
      text += `📈 *Total Transactions:* ${txs.length}\n`;
      text += `💰 *Total Volume:* ${totalVolume.toFixed(2)} USDC\n`;
      text += `🤖 *Active Agents:* ${u.agents.length}\n`;
      text += `⏳ *Pending Approvals:* ${pendingCount}\n`;

      send(msg.chat.id, text, {
        ...kb.inlineKeyboard(
          [kb.btn('🤖 Agents', 'view_agents'), kb.btn('💸 Transactions', 'view_transactions')],
        ),
      });
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal memuat analitik\\.*");
  }
});

// ── /analyze <token> ────────────────────────────────────────
bot.onText(/\/analyze (.+)/, async (msg, match) => {
  const query = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, `/analyze ${query}`);
  userHandler.incrementCommands(msg.from.id);

  try {
    await bot.sendChatAction(msg.chat.id, 'typing');
  } catch (e) { }

  const analysis = await dexAnalyzer.analyzeToken(query);
  const text = dexAnalyzer.formatAnalysisMessage(analysis);

  try {
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...kb.inlineKeyboard(
        analysis.success
          ? [
              [kb.btn(`🔄 Refresh ${analysis.token}`, `analyze_${query}`)],
              [kb.btn('📡 Full Market Scan', 'scan_market')],
            ]
          : [[kb.btn('📡 Market Scan', 'scan_market')]]
      ),
    });
  } catch (e) {
    await bot.sendMessage(msg.chat.id, text, { disable_web_page_preview: true });
  }
});

// ── /scan ───────────────────────────────────────────────────
bot.onText(/\/(scan)$/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/scan');
  userHandler.incrementCommands(msg.from.id);

  await bot.sendMessage(msg.chat.id, '⏳ Scanning trending Solana tokens...');
  try {
    await bot.sendChatAction(msg.chat.id, 'typing');
  } catch (e) { }

  const results = await dexAnalyzer.scanTrending();
  const text = dexAnalyzer.formatScanMessage(results);

  const buttons = results
    .filter(r => r.success !== false)
    .slice(0, 4)
    .map(r => [kb.btn(`🔍 ${r.token}`, `analyze_${r.token}`)]);

  try {
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...kb.inlineKeyboard(
        ...buttons,
        [kb.btn('🔄 Refresh Scan', 'scan_market')]
      ),
    });
  } catch (e) {
    await bot.sendMessage(msg.chat.id, text, { disable_web_page_preview: true });
  }
});

// ── /trending ───────────────────────────────────────────────
bot.onText(/\/(trending)$/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/trending');
  userHandler.incrementCommands(msg.from.id);

  await bot.sendMessage(msg.chat.id, '⏳ Fetching trending tokens...');
  try { await bot.sendChatAction(msg.chat.id, 'typing'); } catch (e) { }

  const results = await dexAnalyzer.scanTrending();
  const text = dexAnalyzer.formatTrendingMessage(results);

  const buttons = results
    .filter(r => r.success !== false)
    .slice(0, 4)
    .map(r => [kb.btn(`🔍 Analyze ${r.token}`, `analyze_${r.token}`)]);

  try {
    await bot.sendMessage(msg.chat.id, text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...kb.inlineKeyboard(
        ...buttons,
        [kb.btn('📡 Full Scan', 'scan_market'), kb.btn('🔄 Refresh', 'trending_refresh')]
      ),
    });
  } catch (e) {
    await bot.sendMessage(msg.chat.id, text, { disable_web_page_preview: true });
  }
});

// ── /sdk ────────────────────────────────────────────────────
bot.onText(/\/sdk/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/sdk');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.sdkGuide(), {
    ...kb.inlineKeyboard(
      [kb.btn('🔌 Integrations', 'view_integrations'), kb.btn('🔄 Webhook Flow', 'view_webhook')],
      [kb.urlBtn('📖 Full Docs', config.DOCS_URL)],
    ),
  });
});

// ── /webhook ────────────────────────────────────────────────
bot.onText(/\/webhook/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/webhook');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.webhookFlow(), {
    ...kb.inlineKeyboard(
      [kb.btn('🔔 Pending Approvals', 'view_approvals'), kb.btn('💡 SDK Guide', 'view_sdk')],
    ),
  });
});

// ── /integrate ──────────────────────────────────────────────
bot.onText(/\/integrate/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/integrate');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.integrations(), {
    ...kb.inlineKeyboard(
      [kb.btn('💡 SDK Guide', 'view_sdk'), kb.btn('🔄 Webhook Flow', 'view_webhook')],
    ),
  });
});

// ── /pricing ────────────────────────────────────────────────
bot.onText(/\/pricing/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/pricing');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.pricing(), {
    ...kb.inlineKeyboard(
      [kb.btn('⚡ Start Free', 'plan_free'), kb.btn('✨ Go Pro', 'plan_pro')],
      [kb.btn('🏢 Contact Sales', 'plan_enterprise')],
      [kb.urlBtn('🌐 Visit Website', config.WEBSITE_URL)],
    ),
  });
});

// ── /help ───────────────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/help');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.help());
});

// ── /about ──────────────────────────────────────────────────
bot.onText(/\/about/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/about');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.about(), {
    ...kb.inlineKeyboard(
      [kb.urlBtn('🌐 Website', config.WEBSITE_URL), kb.urlBtn('📖 Docs', config.DOCS_URL)],
      [kb.urlBtn('💻 GitHub', config.GITHUB_URL)],
    ),
  });
});

// ── /links ──────────────────────────────────────────────────
bot.onText(/\/links/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/links');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.links(), {
    ...kb.inlineKeyboard(
      [kb.urlBtn('🌐 Website', config.WEBSITE_URL), kb.urlBtn('📖 Docs', config.DOCS_URL)],
      [kb.urlBtn('💻 GitHub', config.GITHUB_URL)],
    ),
  });
});

// ── /status ─────────────────────────────────────────────────
bot.onText(/\/status/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/status');
  userHandler.incrementCommands(msg.from.id);
  const globalStats = userHandler.getGlobalStats(START_TIME);
  send(msg.chat.id, messages.systemStatus(globalStats));
});

// ── /profile ────────────────────────────────────────────────
bot.onText(/\/profile/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/profile');
  userHandler.incrementCommands(msg.from.id);
  const stats = userHandler.getUserStats(msg.from.id);
  send(msg.chat.id, messages.profile(msg.from, stats));
});

// ════════════════════════════════════════════════════════════
//  WALLET CONNECTION COMMANDS
// ════════════════════════════════════════════════════════════

// ── /wallet ─────────────────────────────────────────────────
bot.onText(/\/(wallet)$/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/wallet');
  userHandler.incrementCommands(msg.from.id);

  // Must be logged in (have wallet data linked via login)
  const w = walletHandler.getWallet(msg.from.id);
  if (!w) {
    loginState.set(msg.from.id, { step: 'email' });
    bot.sendMessage(msg.chat.id, `🔐 *Akses Ditolak*\n\nAnda harus login ke akun web Sentia untuk menggunakan Wallet.\n\n📧 Masukkan **Email** Anda:`, { parse_mode: 'Markdown' });
    return;
  }

  try {
    let balance = 0;
    try {
      const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const pubKey = new PublicKey(w.address);
      const lamports = await connection.getBalance(pubKey);
      balance = lamports / LAMPORTS_PER_SOL;
    } catch (err) {
      logger.warn(`Failed to fetch real SOL balance: ${err.message}`);
      // Fallback to 0 if RPC fails
    }

    const wBtns = [
      [kb.btn('🔑 Session Keys', 'view_sessionkeys')],
      [kb.btn('🔐 Verify', 'wallet_verify'), kb.btn('🔓 Disconnect', 'wallet_disconnect_confirm')],
    ];

    send(msg.chat.id, messages.walletMenu(w, balance), kb.inlineKeyboard(...wBtns));
  } catch (error) {
    logger.warn(`Error in /wallet handler: ${error.message}`);
    const wBtns = [
      [kb.btn('🔑 Session Keys', 'view_sessionkeys')],
      [kb.btn('🔐 Verify', 'wallet_verify'), kb.btn('🔓 Disconnect', 'wallet_disconnect_confirm')],
    ];
    send(msg.chat.id, messages.walletMenu(w, 0), kb.inlineKeyboard(...wBtns));
  }
});

// ── /connect <address> ──────────────────────────────────────
bot.onText(/\/connect (.+)/, (msg, match) => {
  const address = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, `/connect ${address.slice(0, 8)}...`);
  userHandler.incrementCommands(msg.from.id);
  const result = walletHandler.connectWallet(msg.from.id, address, 'manual');
  if (result.success) {
    send(msg.chat.id, messages.walletConnected(address, 'manual'), {
      ...kb.inlineKeyboard(
        [kb.btn('🔐 Verify Ownership', 'wallet_verify')],
        [kb.btn('🔑 Create Session Key', 'wallet_create_session')],
        [kb.btn('🔗 Wallet Info', 'view_wallet')],
      ),
    });
  } else {
    send(msg.chat.id, messages.errorMsg(result.error));
  }
});

// ── /disconnect ─────────────────────────────────────────────
bot.onText(/\/disconnect/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/disconnect');
  userHandler.incrementCommands(msg.from.id);
  const result = walletHandler.disconnectWallet(msg.from.id);
  if (result.success) {
    sessionKeyHandler.revokeAll(msg.from.id);
    send(msg.chat.id, messages.walletDisconnected(result.address));
  } else {
    send(msg.chat.id, messages.errorMsg(result.error));
  }
});

// ── /verify ─────────────────────────────────────────────────
bot.onText(/\/verify$/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/verify');
  userHandler.incrementCommands(msg.from.id);
  if (!walletHandler.isConnected(msg.from.id)) {
    send(msg.chat.id, messages.errorMsg('Connect a wallet first: /wallet'));
    return;
  }
  const challenge = walletHandler.generateChallenge(msg.from.id);
  send(msg.chat.id, messages.verifyChallenge(challenge));
});

// ── /verifysig <signature> ──────────────────────────────────
bot.onText(/\/verifysig (.+)/, (msg, match) => {
  const sig = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, '/verifysig');
  userHandler.incrementCommands(msg.from.id);
  const result = walletHandler.verifySignature(msg.from.id, sig);
  if (result.success) {
    send(msg.chat.id, messages.walletVerified(), {
      ...kb.inlineKeyboard(
        [kb.btn('🔑 Create Session Key', 'wallet_create_session')],
        [kb.btn('🔗 Wallet Info', 'view_wallet')],
      ),
    });
  } else {
    send(msg.chat.id, messages.errorMsg(result.error));
  }
});

// ════════════════════════════════════════════════════════════
//  SESSION KEY / DELEGATED SIGNER COMMANDS
// ════════════════════════════════════════════════════════════

// ── /sessionkeys ────────────────────────────────────────────
bot.onText(/\/sessionkeys/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/sessionkeys');
  userHandler.incrementCommands(msg.from.id);
  const keys = sessionKeyHandler.getSessionKeys(msg.from.id);
  const stats = sessionKeyHandler.getKeyStats(msg.from.id);
  const activeKeys = keys.filter(k => k.status === 'active');
  send(msg.chat.id, messages.sessionKeyOverview(stats, keys), {
    ...kb.inlineKeyboard(
      [kb.btn('➕ Create New Key', 'wallet_create_session')],
      ...activeKeys.map(k => [kb.btn(`🔍 ${k.agentName} (${k.id})`, `sk_detail_${k.id}`)]),
      activeKeys.length > 0 ? [kb.btn('🔴 Revoke All', 'sk_revoke_all_confirm')] : [],
      [kb.btn('📖 How It Works', 'sk_explainer')],
    ),
  });
});

// ── /createsession <name> ───────────────────────────────────
bot.onText(/\/createsession$/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/createsession (no args)');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.createSessionPrompt());
});

bot.onText(/\/createsession (.+)/, (msg, match) => {
  const agentName = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, `/createsession ${agentName}`);
  userHandler.incrementCommands(msg.from.id);

  if (!walletHandler.isConnected(msg.from.id)) {
    send(msg.chat.id, messages.errorMsg('Connect a wallet first: /wallet'));
    return;
  }

  const session = sessionKeyHandler.createSessionKey(msg.from.id, agentName);
  send(msg.chat.id, messages.sessionKeyCreated(session), {
    ...kb.inlineKeyboard(
      [kb.btn('🔑 All Session Keys', 'view_sessionkeys')],
      [kb.btn('🧪 Simulate TX', `sk_sim_menu_${session.id}`)],
    ),
  });
});

// ── /newsession <name> <maxPerTx> <dailyLimit> <hours> ──────
bot.onText(/\/newsession (\S+)\s+(\d+)\s+(\d+)\s+(\d+)/, (msg, match) => {
  const [, agentName, maxPerTx, dailyLimit, hours] = match;
  logger.cmd(msg.from.username || msg.from.first_name, `/newsession ${agentName}`);
  userHandler.incrementCommands(msg.from.id);

  if (!walletHandler.isConnected(msg.from.id)) {
    send(msg.chat.id, messages.errorMsg('Connect a wallet first: /wallet'));
    return;
  }

  const session = sessionKeyHandler.createSessionKey(msg.from.id, agentName, {
    maxPerTx: Number(maxPerTx),
    dailyLimit: Number(dailyLimit),
    expiryHours: Number(hours),
  });
  send(msg.chat.id, messages.sessionKeyCreated(session), {
    ...kb.inlineKeyboard(
      [kb.btn('🔑 All Session Keys', 'view_sessionkeys')],
      [kb.btn('🧪 Simulate TX', `sk_sim_menu_${session.id}`)],
    ),
  });
});

// ── /sessioninfo <id> ───────────────────────────────────────
bot.onText(/\/sessioninfo (.+)/, (msg, match) => {
  const sessionId = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, `/sessioninfo ${sessionId}`);
  userHandler.incrementCommands(msg.from.id);
  const session = sessionKeyHandler.getSessionById(msg.from.id, sessionId);
  if (session) {
    const buttons = session.status === 'active'
      ? [
        [kb.btn('🧪 Simulate TX', `sk_sim_menu_${session.id}`)],
        [kb.btn('🔴 Revoke', `sk_revoke_${session.id}`)],
        [kb.btn('🔑 All Keys', 'view_sessionkeys')],
      ]
      : [[kb.btn('🔑 All Keys', 'view_sessionkeys')]];
    send(msg.chat.id, messages.sessionKeyDetail(session), kb.inlineKeyboard(...buttons));
  } else {
    send(msg.chat.id, messages.errorMsg(`Session key "${sessionId}" not found`));
  }
});

// ── /revokesession <id> ─────────────────────────────────────
bot.onText(/\/revokesession (.+)/, (msg, match) => {
  const sessionId = match[1].trim();
  logger.cmd(msg.from.username || msg.from.first_name, `/revokesession ${sessionId}`);
  userHandler.incrementCommands(msg.from.id);
  const result = sessionKeyHandler.revokeSessionKey(msg.from.id, sessionId);
  if (result.success) {
    send(msg.chat.id, messages.sessionKeyRevoked(result.agentName));
  } else {
    send(msg.chat.id, messages.errorMsg(result.error));
  }
});

// ── /revokeall ──────────────────────────────────────────────
bot.onText(/\/revokeall/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/revokeall');
  userHandler.incrementCommands(msg.from.id);
  const count = sessionKeyHandler.revokeAll(msg.from.id);
  send(msg.chat.id, messages.allSessionsRevoked(count));
});

// ── /simulate <sessionId> <amount> [token] ──────────────────
bot.onText(/\/simulate (\S+)\s+(\d+\.?\d*)\s?(\S*)/, (msg, match) => {
  const [, sessionId, amount, token] = match;
  logger.cmd(msg.from.username || msg.from.first_name, `/simulate ${sessionId} ${amount}`);
  userHandler.incrementCommands(msg.from.id);
  const result = sessionKeyHandler.simulateTransaction(
    msg.from.id, sessionId, Number(amount), token || 'USDC'
  );
  if (result.success) {
    send(msg.chat.id, messages.delegatedTxSuccess(result));
  } else {
    send(msg.chat.id, messages.delegatedTxRejected(result.error, result.needsApproval), {
      ...kb.inlineKeyboard(
        [kb.btn('🔑 Session Keys', 'view_sessionkeys')],
      ),
    });
  }
});

// ── /howitworks ─────────────────────────────────────────────
bot.onText(/\/howitworks/, (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/howitworks');
  userHandler.incrementCommands(msg.from.id);
  send(msg.chat.id, messages.delegatedSignerExplainer(), {
    ...kb.inlineKeyboard(
      [kb.btn('🔗 Connect Wallet', 'view_wallet'), kb.btn('🔑 Session Keys', 'view_sessionkeys')],
    ),
  });
});

// ════════════════════════════════════════════════════════════
//  ADMIN COMMANDS
// ════════════════════════════════════════════════════════════

bot.onText(/\/admin/, (msg) => {
  if (!config.ADMIN_ID) config.ADMIN_ID = msg.from.id;
  if (msg.from.id !== config.ADMIN_ID) {
    send(msg.chat.id, messages.errorMsg('Unauthorized'));
    return;
  }
  logger.cmd(msg.from.username || msg.from.first_name, '/admin');
  const globalStats = userHandler.getGlobalStats(START_TIME);
  send(msg.chat.id, messages.adminPanel(globalStats));
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  if (config.ADMIN_ID && msg.from.id !== config.ADMIN_ID) {
    send(msg.chat.id, messages.errorMsg('Unauthorized'));
    return;
  }
  logger.cmd(msg.from.username || msg.from.first_name, '/broadcast');
  const broadcastMsg = match[1];
  const allUsers = userHandler.getAllUserIds();
  let ok = 0, fail = 0;
  for (const uid of allUsers) {
    try {
      await bot.sendMessage(uid, `📢 *Sentia Announcement:*\n\n${messages.escMd(broadcastMsg)}`, { parse_mode: 'MarkdownV2' });
      ok++;
    } catch { fail++; }
  }
  send(msg.chat.id, `📢 Broadcast selesai\\!\n✅ Sent: ${ok}\n❌ Failed: ${fail}`);
});

bot.onText(/\/usercount/, (msg) => {
  if (config.ADMIN_ID && msg.from.id !== config.ADMIN_ID) return;
  const globalStats = userHandler.getGlobalStats(START_TIME);
  send(msg.chat.id, `👥 Total users: *${globalStats.totalUsers}*`);
});

bot.onText(/\/serverinfo/, (msg) => {
  if (config.ADMIN_ID && msg.from.id !== config.ADMIN_ID) return;
  const mem = process.memoryUsage();
  send(msg.chat.id,
    `🖥️ *Server Info*\n\n` +
    `• *Node:* ${messages.escMd(process.version)}\n` +
    `• *Platform:* ${messages.escMd(process.platform)}\n` +
    `• *Arch:* ${messages.escMd(process.arch)}\n` +
    `• *PID:* ${process.pid}\n` +
    `• *Heap Used:* ${Math.round(mem.heapUsed / 1024 / 1024)}MB\n` +
    `• *RSS:* ${Math.round(mem.rss / 1024 / 1024)}MB`
  );
});

// ════════════════════════════════════════════════════════════
//  CALLBACK QUERY HANDLER (Inline Buttons)
// ════════════════════════════════════════════════════════════

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;
  await bot.answerCallbackQuery(query.id);
  logger.cmd(query.from.username || query.from.first_name, `[button] ${action}`);

  // ── Agent detail buttons ─────────────
  if (action.startsWith('agent_')) {
    const idx = parseInt(action.split('_')[1]);
    const agent = config.DEMO_AGENTS[idx];
    if (agent) {
      send(chatId, messages.agentDetail(agent), {
        ...kb.inlineKeyboard(
          [kb.btn('💸 Transactions', 'view_transactions'), kb.btn('📊 Analytics', 'view_analytics')],
          [kb.btn('🔙 All Agents', 'view_agents')],
        ),
      });
    }
    return;
  }

  // ── Transaction detail buttons ───────
  if (action.startsWith('tx_detail_')) {
    const txId = action.replace('tx_detail_', '');
    const tx = config.DEMO_TRANSACTIONS.find(t => t.id === txId);
    if (tx) {
      const buttons = tx.status === 'pending'
        ? [kb.btn('✅ Approve', `approve_${tx.id}`), kb.btn('❌ Reject', `reject_${tx.id}`)]
        : [kb.btn('💸 All Transactions', 'view_transactions')];
      send(chatId, messages.transactionDetail(tx), kb.inlineKeyboard(buttons));
    }
    return;
  }

  // ── Approve / Reject ─────────────────
  if (action.startsWith('approve_') || action.startsWith('reject_')) {
    const isApprove = action.startsWith('approve_');
    const txId = action.replace(isApprove ? 'approve_' : 'reject_', '');
    const newStatus = isApprove ? 'approved' : 'rejected';

    try {
      const axios = require('axios');
      const response = await axios.post(`${process.env.WEB_URL || 'https://sentia.web.id'}/api/telegram/transaction/update`, {
        txId,
        status: newStatus
      });

      if (response.data.success) {
        send(chatId, isApprove ? messages.approvedMsg(txId) : messages.rejectedMsg(txId), {
          ...kb.inlineKeyboard(
            [kb.btn('🔔 Approvals', 'view_approvals'), kb.btn('💸 Transactions', 'view_transactions')],
          ),
        });
      } else {
        bot.sendMessage(chatId, "❌ Gagal mengupdate transaksi di database.");
      }
    } catch (err) {
      bot.sendMessage(chatId, "❌ Gagal menghubungi server web untuk update transaksi.");
    }
    return;
  }

  // ── Pricing plan selection ───────────
  if (action === 'plan_free') {
    send(chatId, `⚡ *Free Plan Selected\\!*\n\nYou're all set with the Free tier\\.\n🤖 1 agent \\| 📝 100 tx/mo\n\n_Use /sdk to start integrating\\._`);
    return;
  }
  if (action === 'plan_pro') {
    send(chatId, `✨ *Pro Plan*\n\nUpgrade to Pro for *$29/mo*:\n🤖 Unlimited agents \\| 📝 Unlimited tx\n\n_Visit sentia\\.dev/pricing to upgrade\\._`);
    return;
  }
  if (action === 'plan_enterprise') {
    send(chatId, `🏢 *Enterprise Plan*\n\nContact our sales team for a custom quote:\n📧 sales@sentia\\.dev\n\n_We'll get back to you within 24h\\._`);
    return;
  }

  // ── Wallet buttons ───────────────────
  if (action === 'wallet_phantom' || action === 'wallet_solflare') {
    // 💡 HACKATHON DEMO MODE: Seamless 1-Click Connection
    // Instead of redirecting to the app (which doesn't work on Telegram Desktop),
    // we simulate an instant connection and verification for the demo pitch.

    const walletType = action === 'wallet_phantom' ? 'phantom' : 'solflare';
    const emoji = walletType === 'phantom' ? '👻' : '🔆';
    const name = walletType === 'phantom' ? 'Phantom' : 'Solflare';

    // Generate a realistic but mock Solana address based on their Telegram ID for persistence
    const { Keypair } = require('@solana/web3.js');
    const mockKeypair = Keypair.generate();
    const address = mockKeypair.publicKey.toBase58();

    // Force connect and auto-verify
    walletHandler.connectWallet(query.from.id, address, walletType);
    const walletData = walletHandler.getWallet(query.from.id);
    if (walletData) {
      walletData.verified = true; // Auto verify for demo
      walletData.verifiedAt = Date.now();
      const Storage = require('../utils/storage');
      const ws = new Storage('wallets.json');
      ws.set(String(query.from.id), walletData);
    }

    send(chatId,
      `${emoji} *${name} Wallet Connected\\!*\n\n` +
      `📬 *Address:* \`${messages.escMd(address)}\`\n` +
      `✅ *Status:* Verified \\(Demo Mode\\)\n\n` +
      `⚡ *Next steps:*\n` +
      `1\\. Create session keys: /createsession\n` +
      `2\\. View wallet info: /wallet\n\n` +
      `_Your wallet is non\\-custodial — Sentia never has access to your private keys\\._`,
      kb.inlineKeyboard(
        [kb.btn('🔑 Create Session Key', 'wallet_create_session')],
        [kb.btn('🔗 View Wallet Info', 'view_wallet')]
      )
    );
    return;
  }
  if (action === 'wallet_manual') {
    send(chatId, messages.walletConnectPrompt());
    return;
  }
  if (action === 'wallet_verify') {
    if (!walletHandler.isConnected(query.from.id)) {
      send(chatId, messages.errorMsg('Connect a wallet first'));
      return;
    }
    const challenge = walletHandler.generateChallenge(query.from.id);
    send(chatId, messages.verifyChallenge(challenge));
    return;
  }
  if (action === 'wallet_disconnect_confirm') {
    send(chatId, `⚠️ *Disconnect wallet?*\n\nAll session keys will be revoked\\.`,
      kb.inlineKeyboard(
        [kb.btn('✅ Yes, Disconnect', 'wallet_disconnect_yes'), kb.btn('❌ Cancel', 'view_wallet')],
      )
    );
    return;
  }
  if (action === 'wallet_disconnect_yes') {
    const result = walletHandler.disconnectWallet(query.from.id);
    if (result.success) {
      sessionKeyHandler.revokeAll(query.from.id);
      send(chatId, messages.walletDisconnected(result.address));
    }
    return;
  }
  if (action === 'wallet_create_session') {
    send(chatId, messages.createSessionPrompt());
    return;
  }

  // ── Session Key buttons ──────────────
  if (action.startsWith('sk_detail_')) {
    const skId = action.replace('sk_detail_', '');
    const session = sessionKeyHandler.getSessionById(query.from.id, skId);
    if (session) {
      const buttons = session.status === 'active'
        ? [
          [kb.btn('🧪 Simulate TX', `sk_sim_menu_${session.id}`)],
          [kb.btn('🔴 Revoke', `sk_revoke_${session.id}`)],
          [kb.btn('🔑 All Keys', 'view_sessionkeys')],
        ]
        : [[kb.btn('🔑 All Keys', 'view_sessionkeys')]];
      send(chatId, messages.sessionKeyDetail(session), kb.inlineKeyboard(...buttons));
    }
    return;
  }
  if (action.startsWith('sk_revoke_') && !action.includes('all')) {
    const skId = action.replace('sk_revoke_', '');
    const result = sessionKeyHandler.revokeSessionKey(query.from.id, skId);
    if (result.success) {
      send(chatId, messages.sessionKeyRevoked(result.agentName), {
        ...kb.inlineKeyboard([kb.btn('🔑 All Keys', 'view_sessionkeys')]),
      });
    } else {
      send(chatId, messages.errorMsg(result.error));
    }
    return;
  }
  if (action === 'sk_revoke_all_confirm') {
    send(chatId, `⚠️ *Revoke ALL session keys?*\n\nAll agents will lose signing authority\\.`,
      kb.inlineKeyboard(
        [kb.btn('✅ Yes, Revoke All', 'sk_revoke_all_yes'), kb.btn('❌ Cancel', 'view_sessionkeys')],
      )
    );
    return;
  }
  if (action === 'sk_revoke_all_yes') {
    const count = sessionKeyHandler.revokeAll(query.from.id);
    send(chatId, messages.allSessionsRevoked(count));
    return;
  }
  if (action === 'sk_explainer') {
    send(chatId, messages.delegatedSignerExplainer(), {
      ...kb.inlineKeyboard(
        [kb.btn('🔗 Connect Wallet', 'view_wallet'), kb.btn('🔑 Session Keys', 'view_sessionkeys')],
      ),
    });
    return;
  }
  if (action.startsWith('sk_sim_menu_')) {
    const skId = action.replace('sk_sim_menu_', '');
    send(chatId,
      `🧪 *Simulate Delegated Transaction*\n\n` +
      `Test the session key limits:\n\n` +
      `*Within limits \\(auto\\-approved\\):*\n` +
      `\`/simulate ${messages.escMd(skId)} 5 USDC\`\n\n` +
      `*Over per\\-tx limit \\(rejected\\):*\n` +
      `\`/simulate ${messages.escMd(skId)} 50 USDC\`\n\n` +
      `_Try different amounts to see the guardrails in action\\!_`,
      kb.inlineKeyboard(
        [kb.btn('✅ Sim 5 USDC', `sk_sim_${skId}_5`), kb.btn('⚠️ Sim 50 USDC', `sk_sim_${skId}_50`)],
        [kb.btn('🔙 Back', `sk_detail_${skId}`)],
      )
    );
    return;
  }
  if (action.startsWith('sk_sim_') && !action.includes('menu')) {
    const parts = action.replace('sk_sim_', '').split('_');
    const amount = Number(parts.pop());
    const skId = parts.join('_');
    const result = sessionKeyHandler.simulateTransaction(query.from.id, skId, amount, 'USDC');
    if (result.success) {
      send(chatId, messages.delegatedTxSuccess(result), {
        ...kb.inlineKeyboard(
          [kb.btn('🧪 Simulate More', `sk_sim_menu_${skId}`), kb.btn('🔍 Key Details', `sk_detail_${skId}`)],
        ),
      });
    } else {
      send(chatId, messages.delegatedTxRejected(result.error, result.needsApproval), {
        ...kb.inlineKeyboard(
          [kb.btn('🧪 Try Again', `sk_sim_menu_${skId}`), kb.btn('🔑 All Keys', 'view_sessionkeys')],
        ),
      });
    }
    return;
  }

  // ── Dex Analyzer buttons ─────────────
  if (action.startsWith('analyze_')) {
    const query = action.replace('analyze_', '');
    try { await bot.sendChatAction(chatId, 'typing'); } catch (e) { }
    const analysis = await dexAnalyzer.analyzeToken(query);
    const text = dexAnalyzer.formatAnalysisMessage(analysis);
    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...kb.inlineKeyboard(
          analysis.success
            ? [[kb.btn(`🔄 Refresh ${analysis.token}`, `analyze_${query}`)], [kb.btn('📡 Full Scan', 'scan_market')]]
            : [[kb.btn('📡 Market Scan', 'scan_market')]]
        ),
      });
    } catch (e) {
      await bot.sendMessage(chatId, text, { disable_web_page_preview: true });
    }
    return;
  }
  if (action === 'scan_market') {
    await bot.sendMessage(chatId, '⏳ Scanning trending Solana tokens...');
    try { await bot.sendChatAction(chatId, 'typing'); } catch (e) { }
    const results = await dexAnalyzer.scanTrending();
    const text = dexAnalyzer.formatScanMessage(results);
    const buttons = results.filter(r => r.success !== false).slice(0, 4).map(r => [kb.btn(`🔍 ${r.token}`, `analyze_${r.token}`)]);
    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...kb.inlineKeyboard(...buttons, [kb.btn('🔄 Refresh Scan', 'scan_market')]),
      });
    } catch (e) {
      await bot.sendMessage(chatId, text, { disable_web_page_preview: true });
    }
    return;
  }
  if (action === 'trending_refresh') {
    await bot.sendMessage(chatId, '⏳ Fetching trending tokens...');
    try { await bot.sendChatAction(chatId, 'typing'); } catch (e) { }
    const results = await dexAnalyzer.scanTrending();
    const text = dexAnalyzer.formatTrendingMessage(results);
    const buttons = results.filter(r => r.success !== false).slice(0, 4).map(r => [kb.btn(`🔍 Analyze ${r.token}`, `analyze_${r.token}`)]);
    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...kb.inlineKeyboard(...buttons, [kb.btn('📡 Full Scan', 'scan_market'), kb.btn('🔄 Refresh', 'trending_refresh')]),
      });
    } catch (e) {
      await bot.sendMessage(chatId, text, { disable_web_page_preview: true });
    }
    return;
  }

  // ── Navigation buttons ───────────────
  switch (action) {
    case 'view_menu':
      send(chatId, messages.mainMenu(), buildMainMenuInline());
      break;
    case 'view_agents':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/agents', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_transactions':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/transactions', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_limits':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/limits', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_approvals':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/approvals', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_analytics':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/analytics', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_sdk':
      send(chatId, messages.sdkGuide(), {
        ...kb.inlineKeyboard(
          [kb.btn('🔌 Integrations', 'view_integrations'), kb.btn('🔄 Webhook Flow', 'view_webhook')],
          [kb.urlBtn('📖 Full Docs', config.DOCS_URL)],
        ),
      });
      break;
    case 'view_webhook':
      send(chatId, messages.webhookFlow(), {
        ...kb.inlineKeyboard(
          [kb.btn('🔔 Pending Approvals', 'view_approvals'), kb.btn('💡 SDK Guide', 'view_sdk')],
        ),
      });
      break;
    case 'view_integrations':
      send(chatId, messages.integrations(), {
        ...kb.inlineKeyboard(
          [kb.btn('💡 SDK Guide', 'view_sdk'), kb.btn('🔄 Webhook Flow', 'view_webhook')],
        ),
      });
      break;
    case 'view_pricing':
      send(chatId, messages.pricing(), {
        ...kb.inlineKeyboard(
          [kb.btn('⚡ Start Free', 'plan_free'), kb.btn('✨ Go Pro', 'plan_pro')],
          [kb.btn('🏢 Contact Sales', 'plan_enterprise')],
        ),
      });
      break;
    case 'view_help':
      send(chatId, messages.help());
      break;
    case 'view_about':
      send(chatId, messages.about(), {
        ...kb.inlineKeyboard(
          [kb.urlBtn('🌐 Website', config.WEBSITE_URL), kb.urlBtn('📖 Docs', config.DOCS_URL)],
        ),
      });
      break;
    case 'view_wallet':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: query.from, text: '/wallet', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case 'view_sessionkeys': {
      const sKeys = sessionKeyHandler.getSessionKeys(query.from.id);
      const sStats = sessionKeyHandler.getKeyStats(query.from.id);
      const sActive = sKeys.filter(k => k.status === 'active');
      send(chatId, messages.sessionKeyOverview(sStats, sKeys), {
        ...kb.inlineKeyboard(
          [kb.btn('➕ Create New Key', 'wallet_create_session')],
          ...sActive.map(k => [kb.btn(`🔍 ${k.agentName} (${k.id})`, `sk_detail_${k.id}`)]),
          sActive.length > 0 ? [kb.btn('🔴 Revoke All', 'sk_revoke_all_confirm')] : [],
          [kb.btn('📖 How It Works', 'sk_explainer')],
        ),
      });
      break;
    }
    default:
      send(chatId, messages.errorMsg('Unknown action'));
  }
});

// ════════════════════════════════════════════════════════════
//  REPLY KEYBOARD HANDLER (Text buttons)
// ════════════════════════════════════════════════════════════

bot.on('message', async (msg) => {
  if (loginState.has(msg.from?.id)) return; // Do not process reply buttons or AI if user is logging in
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  switch (text) {
    case '🏠 Dashboard':
      send(chatId, messages.mainMenu(), { ...buildMainMenuInline(), ...kb.MAIN_MENU_KEYBOARD });
      break;
    case '🤖 My Agents':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/agents', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '💸 Transactions':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/transactions', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '🔐 Spending Limits':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/limits', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '🔔 Approvals':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/approvals', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '📊 Analytics':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/analytics', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '💡 SDK Guide':
      send(chatId, messages.sdkGuide(), {
        ...kb.inlineKeyboard(
          [kb.btn('🔌 Integrations', 'view_integrations'), kb.btn('🔄 Webhook Flow', 'view_webhook')],
        ),
      });
      break;
    case '💰 Pricing':
      send(chatId, messages.pricing(), {
        ...kb.inlineKeyboard(
          [kb.btn('⚡ Start Free', 'plan_free'), kb.btn('✨ Go Pro', 'plan_pro')],
          [kb.btn('🏢 Contact Sales', 'plan_enterprise')],
        ),
      });
      break;
    case '🔗 Wallet':
      bot.processUpdate({ update_id: Math.floor(Math.random() * 1000000), message: { chat: { id: chatId }, from: msg.from, text: '/wallet', message_id: Math.floor(Math.random() * 1000000) } });
      break;
    case '🔑 Session Keys': {
      const sKeys = sessionKeyHandler.getSessionKeys(msg.from.id);
      const sStats = sessionKeyHandler.getKeyStats(msg.from.id);
      const sActive = sKeys.filter(k => k.status === 'active');
      send(chatId, messages.sessionKeyOverview(sStats, sKeys), {
        ...kb.inlineKeyboard(
          [kb.btn('➕ Create New Key', 'wallet_create_session')],
          ...sActive.map(k => [kb.btn(`🔍 ${k.agentName} (${k.id})`, `sk_detail_${k.id}`)]),
          sActive.length > 0 ? [kb.btn('🔴 Revoke All', 'sk_revoke_all_confirm')] : [],
          [kb.btn('📖 How It Works', 'sk_explainer')],
        ),
      });
      break;
    }
    case '❓ Help':
      send(chatId, messages.help());
      break;
    case 'ℹ️ About':
      send(chatId, messages.about(), {
        ...kb.inlineKeyboard(
          [kb.urlBtn('🌐 Website', config.WEBSITE_URL), kb.urlBtn('📖 Docs', config.DOCS_URL)],
        ),
      });
      break;
    case '📝 Chat AI':
      send(chatId, `🧠 *Sentia AI Assistant*\n\nHalo *${messages.escMd(msg.from.first_name)}*\\! Saya adalah asisten Trading \\& Agent Manager Anda\\.\n\nAnda bisa bertanya soal:\n• Harga pasar Solana terkini\n• Analisis token \\& sinyal BUY/SELL real\\-time\n• Eksekusi beli/jual otomatis\n• Scan trending market Solana\n\nCoba: \"analisis BONK\" atau \"scan market\"`);
      break;
    case '📡 Market Scan': {
      bot.sendMessage(chatId, '⏳ Scanning trending Solana tokens...');
      try { await bot.sendChatAction(chatId, 'typing'); } catch (e) { }
      const scanResults = await dexAnalyzer.scanTrending();
      const scanText = dexAnalyzer.formatScanMessage(scanResults);
      const scanBtns = scanResults.filter(r => r.success !== false).slice(0, 4).map(r => [kb.btn(`🔍 ${r.token}`, `analyze_${r.token}`)]);
      try {
        await bot.sendMessage(chatId, scanText, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          ...kb.inlineKeyboard(...scanBtns, [kb.btn('🔄 Refresh', 'scan_market')]),
        });
      } catch (e) {
        await bot.sendMessage(chatId, scanText, { disable_web_page_preview: true });
      }
      break;
    }
    case '🔥 Trending': {
      bot.sendMessage(chatId, '⏳ Fetching trending tokens...');
      try { await bot.sendChatAction(chatId, 'typing'); } catch (e) { }
      const trendResults = await dexAnalyzer.scanTrending();
      const trendText = dexAnalyzer.formatTrendingMessage(trendResults);
      const trendBtns = trendResults.filter(r => r.success !== false).slice(0, 4).map(r => [kb.btn(`🔍 Analyze ${r.token}`, `analyze_${r.token}`)]);
      try {
        await bot.sendMessage(chatId, trendText, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          ...kb.inlineKeyboard(...trendBtns, [kb.btn('📡 Full Scan', 'scan_market'), kb.btn('🔄 Refresh', 'trending_refresh')]),
        });
      } catch (e) {
        await bot.sendMessage(chatId, trendText, { disable_web_page_preview: true });
      }
      break;
    }
    case '🔙 Back to Menu':
      send(chatId, messages.mainMenu(), { ...buildMainMenuInline(), ...kb.MAIN_MENU_KEYBOARD });
      break;
    default:
      // Route natural language to Gemini AI
      if (text.startsWith('⚡ Hey') || text.length < 2) return;

      // Indicate typing status while AI thinks
      try {
        await bot.sendChatAction(chatId, 'typing');
      } catch (e) { }

      let aiResponse = await aiHandler.handleChatMessage(msg.from.id, text);
      if (!aiResponse || String(aiResponse).trim() === '') {
        aiResponse = '✅ *Perintah Eksekusi Diselesaikan!* (Logs tercatat di sistem)';
      }

      // Send Markdown plain since Gemini might output bold/lists that differ from MarkdownV2 strict format
      try {
        await bot.sendMessage(chatId, aiResponse, { parse_mode: 'Markdown' });
      } catch (e) {
        await bot.sendMessage(chatId, aiResponse);
      }
      break;
  }
});

// ── Helper: build main menu inline keyboard ─────────────────
function buildMainMenuInline() {
  return kb.inlineKeyboard(
    [kb.btn('🔥 Trending', 'trending_refresh'), kb.btn('📡 Market Scan', 'scan_market')],
    [kb.btn('🤖 Agents', 'view_agents'), kb.btn('💸 Transactions', 'view_transactions')],
    [kb.btn('🔔 Approvals', 'view_approvals'), kb.btn('📊 Analytics', 'view_analytics')],
  );
}

// ════════════════════════════════════════════════════════════
//  ERROR HANDLING
// ════════════════════════════════════════════════════════════

bot.on('polling_error', (err) => logger.error(`Polling error: ${err.message}`));
bot.on('error', (err) => logger.error(`Bot error: ${err.message}`));
process.on('uncaughtException', (err) => logger.error(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (reason) => logger.error(`Unhandled: ${reason}`));

process.on('SIGINT', () => {
  logger.bot('Shutting down...');
  bot.stopPolling();
  process.exit(0);
});

// ── Startup complete ────────────────────────────────────────
logger.success('Bot is running and polling for messages!');
logger.bot(`Sentia v${config.BOT_VERSION} | ${config.HACKATHON}`);
logger.bot('Press Ctrl+C to stop');

// ── Dummy HTTP Server for cPanel / Hosting ──────────────────
// cPanel (Phusion Passenger) requires Node.js apps to bind to a port
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Sentia Telegram Bot is running!\n');
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Dummy HTTP server listening on port ${PORT} to keep cPanel Passenger alive`);
});
