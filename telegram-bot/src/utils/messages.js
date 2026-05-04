// ============================================================
// Sentia Agent Wallet - All Bot Message Templates
// ============================================================

const config = require('../config');

// ── Helper: escape MarkdownV2 special chars ─────────────────
function escMd(text) {
  return String(text).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// ══════════════════════════════════════════════════════════════
//  WELCOME & NAVIGATION
// ══════════════════════════════════════════════════════════════

function welcome(firstName) {
  return (
    `⚡ *Welcome to Sentia*\n\n` +
    `Hey *${escMd(firstName)}* 👋\n\n` +
    `Sentia is the *first non\\-custodial wallet SDK* for AI agents on Solana\\.\n\n` +
    `🔹 Set on\\-chain *spending limits*\n` +
    `🔹 Get *approval webhooks* via Telegram\n` +
    `🔹 Monitor every agent *transaction*\n` +
    `🔹 Integrate in just *3 lines of code*\n\n` +
    `_${escMd(config.HACKATHON)}_\n\n` +
    `Use the menu below or type /help to get started 🚀`
  );
}

function mainMenu() {
  return (
    `🏠 *SENTIA DASHBOARD*\n\n` +
    `Navigate the agent wallet infrastructure:\n\n` +
    `🔥 /trending — Trending tokens Solana\n` +
    `📡 /scan — Market scan \\& sinyal\n` +
    `🔬 /analyze \\<token\\> — Deep analysis token\n` +
    `🤖 /agents — View \\& manage agents\n` +
    `💸 /transactions — Riwayat transaksi\n` +
    `🔔 /approvals — Pending approval\n` +
    `📊 /analytics — Spending analytics\n` +
    `❓ /help — Full command reference\n\n` +
    `_Atau gunakan keyboard buttons di bawah_ ⬇️`
  );
}

// ══════════════════════════════════════════════════════════════
//  AGENT WALLET FEATURES
// ══════════════════════════════════════════════════════════════

function agentsList(agents) {
  let text = `🤖 *YOUR AI AGENTS*\n\n`;

  agents.forEach((a, i) => {
    const pct = Math.round((a.spent / a.limit) * 100);
    const barFilled = Math.round(pct / 10);
    const bar = '█'.repeat(barFilled) + '░'.repeat(10 - barFilled);
    const statusEmoji = a.status === 'active' ? '🟢' : '🟡';
    text += `${statusEmoji} *${escMd(a.name)}*\n`;
    text += `   💰 ${escMd(String(a.spent))} / ${escMd(String(a.limit))} ${escMd(a.token)}\n`;
    text += `   \\[${escMd(bar)}\\] ${pct}%\n`;
    text += `   📝 ${a.txCount} transactions\n\n`;
  });

  text += `_Total agents: ${agents.length} \\| `;
  text += `Active: ${agents.filter(a => a.status === 'active').length}_`;
  return text;
}

function agentDetail(agent) {
  const pct = Math.round((agent.spent / agent.limit) * 100);
  const statusEmoji = agent.status === 'active' ? '🟢 Active' : '🟡 Pending Approval';
  const riskLevel = pct > 80 ? '🔴 High' : pct > 50 ? '🟡 Medium' : '🟢 Low';
  
  return (
    `🤖 *AGENT: ${escMd(agent.name)}*\n\n` +
    `📊 *Status:* ${escMd(statusEmoji)}\n` +
    `💰 *Spent:* ${escMd(String(agent.spent))} ${escMd(agent.token)}\n` +
    `🔐 *Daily Limit:* ${escMd(String(agent.limit))} ${escMd(agent.token)}\n` +
    `📈 *Usage:* ${pct}%\n` +
    `⚠️ *Risk Level:* ${escMd(riskLevel)}\n` +
    `📝 *Total Transactions:* ${agent.txCount}\n\n` +
    `_Spending limits are enforced on\\-chain via Solana smart contracts\\._`
  );
}

function transactionsList(txs) {
  let text = `💸 *RECENT TRANSACTIONS*\n\n`;

  txs.forEach((tx, i) => {
    const statusEmoji = tx.status === 'approved' ? '✅' : tx.status === 'pending' ? '⏳' : '❌';
    text += `${statusEmoji} *${escMd(tx.agent)}*\n`;
    text += `   ${escMd(tx.type)} — *${escMd(String(tx.amount))} ${escMd(tx.token)}*\n`;
    text += `   → \`${escMd(tx.to)}\`  \\| ${escMd(tx.time)}\n\n`;
  });

  text += `_All transactions are recorded on\\-chain with full audit trail\\._`;
  return text;
}

function transactionDetail(tx) {
  const statusEmoji = tx.status === 'approved' ? '✅ Approved' : 
                      tx.status === 'pending' ? '⏳ Pending Approval' : '❌ Rejected';
  return (
    `💸 *TRANSACTION ${escMd(tx.id.toUpperCase())}*\n\n` +
    `🤖 *Agent:* ${escMd(tx.agent)}\n` +
    `📋 *Type:* ${escMd(tx.type)}\n` +
    `💰 *Amount:* ${escMd(String(tx.amount))} ${escMd(tx.token)}\n` +
    `📬 *Recipient:* \`${escMd(tx.to)}\`\n` +
    `📊 *Status:* ${escMd(statusEmoji)}\n` +
    `🕐 *Time:* ${escMd(tx.time)}\n\n` +
    `_Verified on Solana blockchain\\._`
  );
}

function spendingLimits(agents) {
  let text = `🔐 *ON\\-CHAIN SPENDING LIMITS*\n\n`;
  text += `Spending limits are enforced by *Solana smart contracts*\\.\n`;
  text += `Agents cannot exceed configured limits without owner approval\\.\n\n`;
  text += `*Current Configuration:*\n\n`;

  agents.forEach(a => {
    const pct = Math.round((a.spent / a.limit) * 100);
    const warning = pct > 80 ? ' ⚠️' : '';
    text += `🤖 *${escMd(a.name)}*${warning}\n`;
    text += `   • Max per\\-tx: ${Math.round(a.limit / 5)} ${escMd(a.token)}\n`;
    text += `   • Daily cap: ${a.limit} ${escMd(a.token)}\n`;
    text += `   • Token: ${escMd(a.token)}\n\n`;
  });

  text += `_To modify limits, update your SentiaWallet config\\._\n`;
  text += `_Changes take effect on\\-chain immediately\\._`;
  return text;
}

function pendingApprovals(txs) {
  const pending = txs.filter(tx => tx.status === 'pending');
  
  if (pending.length === 0) {
    return (
      `🔔 *APPROVAL REQUESTS*\n\n` +
      `✅ _No pending approvals\\!_\n\n` +
      `All agent transactions are within spending limits\\.\n` +
      `You'll be notified here when an agent tries to exceed its limit\\.`
    );
  }

  let text = `🔔 *PENDING APPROVALS* \\(${pending.length}\\)\n\n`;
  text += `⚠️ The following transactions exceed spending limits:\n\n`;

  pending.forEach((tx, i) => {
    text += `${i + 1}\\. 🤖 *${escMd(tx.agent)}*\n`;
    text += `   💰 Amount: *${escMd(String(tx.amount))} ${escMd(tx.token)}*\n`;
    text += `   📋 Type: ${escMd(tx.type)}\n`;
    text += `   → \`${escMd(tx.to)}\`\n\n`;
  });

  text += `_Use the buttons below to approve or reject\\._`;
  return text;
}

function approvalNotification(tx) {
  return (
    `🔔🔔🔔 *APPROVAL REQUIRED* 🔔🔔🔔\n\n` +
    `🤖 *Agent:* ${escMd(tx.agent)}\n` +
    `💰 *Amount:* ${escMd(String(tx.amount))} ${escMd(tx.token)}\n` +
    `📋 *Type:* ${escMd(tx.type)}\n` +
    `📬 *To:* \`${escMd(tx.to)}\`\n\n` +
    `⚠️ This transaction *exceeds the spending limit*\\.\n` +
    `Approve to release funds, or reject to block\\.\n\n` +
    `_Webhook fired via Sentia SDK_`
  );
}

function analytics(agents, txs) {
  const totalSpent = agents.reduce((sum, a) => sum + a.spent, 0);
  const totalTx = agents.reduce((sum, a) => sum + a.txCount, 0);
  const avgPerTx = totalTx > 0 ? (totalSpent / totalTx).toFixed(2) : '0';
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const approvedTx = txs.filter(tx => tx.status === 'approved').length;
  const rejectedTx = txs.filter(tx => tx.status === 'rejected').length;
  const approvalRate = txs.length > 0 ? Math.round((approvedTx / txs.length) * 100) : 0;

  // Simple spending chart using Unicode blocks
  const maxSpent = Math.max(...agents.map(a => a.spent));
  let chart = '';
  agents.forEach(a => {
    const width = Math.round((a.spent / maxSpent) * 15);
    chart += `  ${escMd('▓'.repeat(width))}${'░'.repeat(15 - width)} ${escMd(String(a.spent))}\n`;
    chart += `  _${escMd(a.name)}_\n\n`;
  });

  return (
    `📊 *SPENDING ANALYTICS*\n\n` +
    `*Overview \\(24h\\):*\n` +
    `💰 Total Spent: *$${escMd(totalSpent.toFixed(2))}*\n` +
    `📝 Total Transactions: *${totalTx}*\n` +
    `📈 Avg per Transaction: *$${escMd(avgPerTx)}*\n` +
    `🤖 Active Agents: *${activeAgents}/${agents.length}*\n` +
    `✅ Approval Rate: *${approvalRate}%*\n` +
    `❌ Rejected: *${rejectedTx}*\n\n` +
    `*Spending by Agent \\(USDC\\):*\n\n` +
    chart +
    `_Data refreshes in real\\-time on the Sentia Dashboard\\._`
  );
}

// ══════════════════════════════════════════════════════════════
//  SDK & INTEGRATION
// ══════════════════════════════════════════════════════════════

function sdkGuide() {
  return (
    `💡 *SENTIA SDK — QUICK START*\n\n` +
    `Integrate agent wallets in *3 lines of code*:\n\n` +
    `*Step 1: Install*\n` +
    `\`\`\`\nnpm install sentia\\-sdk\n\`\`\`\n\n` +
    `*Step 2: Initialize*\n` +
    `\`\`\`\nimport { SentiaWallet } from 'sentia\\-sdk'\n\nconst wallet = new SentiaWallet({\n  ownerPubkey: 'YOUR_PUBKEY',\n  maxPerTx: 10,     // 10 USDC\n  dailyLimit: 100,  // 100 USDC/day\n  webhookUrl: 'https://your\\-api/approve'\n})\n\`\`\`\n\n` +
    `*Step 3: Transact*\n` +
    `\`\`\`\nawait wallet\\.transfer({\n  to: 'RECIPIENT',\n  amount: 5,   // Under limit → auto\\-approved\n  token: 'USDC'\n})\n\`\`\`\n\n` +
    `*🔗 Compatible With:*\n` +
    `• ElizaOS\n` +
    `• Solana Agent Kit\n` +
    `• LangChain\n` +
    `• AutoGPT\n` +
    `• CrewAI\n` +
    `• Custom Agents\n\n` +
    `_Full docs: docs\\.sentia\\.dev_`
  );
}

function webhookFlow() {
  return (
    `🔄 *APPROVAL WEBHOOK FLOW*\n\n` +
    `When an agent exceeds spending limits:\n\n` +
    `1️⃣ 🤖 *Agent* → Attempts over\\-limit spend\n` +
    `         ↓\n` +
    `2️⃣ ⚡ *SDK* → Detects \\& fires webhook\n` +
    `         ↓\n` +
    `3️⃣ 🔔 *Notify* → Telegram \\+ Email alert\n` +
    `         ↓\n` +
    `4️⃣ ✅ *Approve* → Owner approves → Funds flow\n\n` +
    `*Key Features:*\n` +
    `⚡ Webhook latency: \\<200ms\n` +
    `🔒 E2E encrypted request signing\n` +
    `📝 Full on\\-chain audit trail\n` +
    `📲 Multi\\-channel: Telegram \\+ Email\n\n` +
    `_Human in the loop\\. Always\\._`
  );
}

// ══════════════════════════════════════════════════════════════
//  PRICING
// ══════════════════════════════════════════════════════════════

function pricing() {
  const p = config.PRICING;
  return (
    `💰 *SENTIA PRICING*\n\n` +
    `Start free\\. Scale as your agents grow\\.\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `⚡ *FREE*\n` +
    `   💵 $0/mo\n` +
    `   🤖 1 agent\n` +
    `   📝 100 tx/mo\n` +
    `   ✅ Basic Dashboard\n` +
    `   ✅ Standard Webhooks\n` +
    `   ✅ Community Support\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `✨ *PRO* ⭐ Popular\n` +
    `   💵 $29/mo \\(\\-20% annually\\)\n` +
    `   🤖 Unlimited agents\n` +
    `   📝 Unlimited transactions\n` +
    `   ✅ Advanced Dashboard\n` +
    `   ✅ Priority Webhooks\n` +
    `   ✅ Email \\+ Telegram alerts\n` +
    `   ✅ Analytics \\& Trends\n` +
    `   ✅ CSV/API Export\n` +
    `   ✅ Priority Support\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `🏢 *ENTERPRISE*\n` +
    `   💵 Custom pricing\n` +
    `   🤖 100\\+ agents\n` +
    `   ✅ Everything in Pro\n` +
    `   ✅ Dedicated Infrastructure\n` +
    `   ✅ Custom Policies\n` +
    `   ✅ SSO \\& Teams\n` +
    `   ✅ SLA 99\\.9%\n` +
    `   ✅ Account Manager\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `💡 _0\\.1% transaction fee on all plans_\n` +
    `_1K agents × $100/mo \\= $100/mo revenue_`
  );
}

// ══════════════════════════════════════════════════════════════
//  HELP & INFO
// ══════════════════════════════════════════════════════════════

function help() {
  return (
    `❓ *SENTIA BOT — COMMAND REFERENCE*\\n\\n` +
    `*📡 Market Analysis:*\\n` +
    `/trending — Trending tokens \\\\(nama \\\\+ alamat\\\\)\\n` +
    `/scan — Scan market \\\\& sinyal BUY/SELL\\n` +
    `/analyze \\\\<token\\\\> — Deep analysis token\\n\\n` +
    `*🏠 Navigation:*\\n` +
    `/start — Welcome \\\\& setup\\n` +
    `/menu — Main dashboard\\n` +
    `/help — This page\\n\\n` +
    `*🤖 Agent Management:*\\n` +
    `/agents — List all your agents\\n\\n` +
    `*💸 Transactions:*\\n` +
    `/transactions — Recent transactions\\n\\n` +
    `*🔐 Security:*\\n` +
    `/limits — Spending limit configs\\n` +
    `/approvals — Pending approval requests\\n\\n` +
    `*👛 Wallet:*\\n` +
    `/wallet — Wallet info\\n` +
    `/login — Link web account\\n` +
    `/dashboard — View web dashboard\\n\\n` +
    `*🧠 AI Assistant:*\\n` +
    `Ketik pesan langsung untuk chat dengan AI\\n` +
    `Contoh: "analisis BONK", "harga SOL"\\n\\n` +
    `_Powered by Solana \\\\| Dexscreener \\\\| Gemini AI_`
  );
}

function about() {
  return (
    `ℹ️ *ABOUT SENTIA*\n\n` +
    `*${escMd(config.BOT_TAGLINE)}*\n\n` +
    `Sentia is the *first non\\-custodial wallet SDK* for AI agents\\.\n` +
    `Built on *Solana*, it gives your agents financial autonomy\n` +
    `while keeping *humans in control*\\.\n\n` +
    `*🔑 Core Features:*\n` +
    `• Agent Wallet SDK \\(3 LOC integration\\)\n` +
    `• On\\-chain spending limits\n` +
    `• Human\\-in\\-the\\-loop approvals\n` +
    `• Real\\-time monitoring dashboard\n` +
    `• Audit trail \\+ CSV export\n` +
    `• Non\\-custodial \\(your keys, your control\\)\n\n` +
    `*⚡ Tech Stack:*\n` +
    `• Solana \\| Anchor \\| Helius \\| Privy\n\n` +
    `*🔗 Compatible With:*\n` +
    `ElizaOS, Solana Agent Kit, LangChain,\n` +
    `AutoGPT, CrewAI, Custom Agents\n\n` +
    `*📌 Version:* ${escMd(config.BOT_VERSION)}\n` +
    `*🏆 Hackathon:* ${escMd(config.HACKATHON)}\n\n` +
    `_Agent Wallets\\. Reimagined\\._`
  );
}

function links() {
  return (
    `🌐 *USEFUL LINKS*\n\n` +
    `🔗 *Website:* sentia\\.dev\n` +
    `📖 *Documentation:* docs\\.sentia\\.dev\n` +
    `💻 *GitHub:* github\\.com/sentia\\-wallet\n\n` +
    `*Socials:*\n` +
    `🐦 *Twitter:* @SentiaWallet\n` +
    `💬 *Discord:* discord\\.gg/sentia\n` +
    `📱 *Telegram Group:* @sentia\\_community\n\n` +
    `*Ecosystem:*\n` +
    `⚡ Solana — solana\\.com\n` +
    `🔧 Helius — helius\\.dev\n` +
    `⚓ Anchor — anchor\\-lang\\.com\n` +
    `🔑 Privy — privy\\.io`
  );
}

function integrations() {
  return (
    `🔌 *FRAMEWORK INTEGRATIONS*\n\n` +
    `Sentia SDK works with all major agent frameworks:\n\n` +
    `*1️⃣ ElizaOS*\n` +
    `\`\`\`\nimport { SentiaPlugin } from 'sentia\\-sdk/eliza'\nagent\\.use(SentiaPlugin({ /\\* config \\*/ }))\n\`\`\`\n\n` +
    `*2️⃣ Solana Agent Kit*\n` +
    `\`\`\`\nimport { withSentia } from 'sentia\\-sdk/solana\\-agent'\nconst agent = withSentia(baseAgent, { /\\* limits \\*/ })\n\`\`\`\n\n` +
    `*3️⃣ LangChain*\n` +
    `\`\`\`\nimport { SentiaTool } from 'sentia\\-sdk/langchain'\ntools\\.push(new SentiaTool({ /\\* config \\*/ }))\n\`\`\`\n\n` +
    `*4️⃣ AutoGPT / CrewAI*\n` +
    `\`\`\`\nimport { SentiaWallet } from 'sentia\\-sdk'\n// Works as a standalone wallet provider\n\`\`\`\n\n` +
    `_All integrations are non\\-custodial and enforce\non\\-chain spending limits\\._`
  );
}

function systemStatus(globalStats) {
  return (
    `🟢 *SYSTEM STATUS*\n\n` +
    `*Sentia Infrastructure:*\n` +
    `⚡ Solana RPC: 🟢 Operational\n` +
    `🔔 Webhooks: 🟢 \\<200ms latency\n` +
    `📊 Dashboard: 🟢 Live\n` +
    `🤖 Agent SDK: 🟢 Online\n\n` +
    `*Bot Stats:*\n` +
    `👥 Total Users: ${globalStats.totalUsers}\n` +
    `💬 Total Interactions: ${globalStats.totalMessages}\n` +
    `⏱️ Uptime: ${escMd(globalStats.uptime)}\n` +
    `💾 Memory: ${escMd(globalStats.memory)}\n\n` +
    `_100% Non\\-Custodial \\| On\\-Chain Enforced_`
  );
}

// ══════════════════════════════════════════════════════════════
//  USER & ADMIN
// ══════════════════════════════════════════════════════════════

function profile(user, stats) {
  const joinDate = new Date(stats.joinDate).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  return (
    `👤 *YOUR SENTIA PROFILE*\n\n` +
    `📛 *Name:* ${escMd(user.first_name || 'N/A')} ${escMd(user.last_name || '')}\n` +
    `🆔 *Username:* @${escMd(user.username || 'not set')}\n` +
    `🔢 *User ID:* \`${user.id}\`\n` +
    `📅 *Joined:* ${escMd(joinDate)}\n` +
    `💬 *Interactions:* ${stats.messageCount || 0}\n` +
    `🤖 *Agents:* ${agentsCount}\n\n` +
    `_Wallet: 8xKm\\.\\.\\.4pRt \\(Solana\\)_`
  );
}

function dashboard(agentsCount) {
  return (
    `🎛 *Sentia Dashboard*\n\n` +
    `🤖 *Agents:* ${agentsCount}\n\n` +
    `Select a module to configure:`
  );
}

function adminPanel(stats) {
  return (
    `🔐 *ADMIN PANEL*\n\n` +
    `*Sentia Bot Statistics:*\n\n` +
    `👥 *Total Users:* ${stats.totalUsers}\n` +
    `💬 *Total Interactions:* ${stats.totalMessages}\n` +
    `⏱️ *Uptime:* ${escMd(stats.uptime)}\n` +
    `💾 *Memory:* ${escMd(stats.memory)}\n\n` +
    `*Admin Commands:*\n` +
    `/admin — This panel\n` +
    `/broadcast \\<msg\\> — Send to all users\n` +
    `/usercount — User count\n` +
    `/serverinfo — Server details`
  );
}

// ══════════════════════════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════════════════════════

function errorMsg(msg) {
  return `❌ *Error:* ${escMd(msg)}`;
}

function rateLimited() {
  return `⚠️ *Rate limited\\!* Please wait before sending more messages\\.`;
}

function approvedMsg(txId) {
  return `✅ Transaction *${escMd(txId)}* has been *approved*\\!\nFunds have been released on\\-chain\\.`;
}

function rejectedMsg(txId) {
  return `❌ Transaction *${escMd(txId)}* has been *rejected*\\.\nFunds remain in the agent wallet\\.`;
}

// ══════════════════════════════════════════════════════════════
//  WALLET CONNECTION
// ══════════════════════════════════════════════════════════════

function walletMenu(wallet, balance = null) {
  if (!wallet) {
    return (
      `🔗 *WALLET CONNECTION*\n\n` +
      `No wallet connected yet\\.\n\n` +
      `Connect your Solana wallet to:\n` +
      `• Create session keys for AI agents\n` +
      `• Set on\\-chain spending limits\n` +
      `• Approve transactions directly\n` +
      `• Monitor agent activity\n\n` +
      `*Choose your wallet:*`
    );
  }

  const addr = escMd(wallet.address);
  const shortAddr = `${escMd(wallet.address.slice(0, 4))}\\.\\.\\.\\.${escMd(wallet.address.slice(-4))}`;
  const walletEmoji = wallet.walletType === 'phantom' ? '👻' : 
                      wallet.walletType === 'solflare' ? '🔆' : '🔗';
  const verifiedBadge = wallet.verified ? '✅ Verified' : '⚠️ Not verified';
  const connDate = new Date(wallet.connectedAt).toLocaleDateString('id-ID');
  
  let balanceText = '';
  if (balance !== null) {
    balanceText = `💰 *Balance:* \`${balance.toFixed(4)} SOL\`\n`;
  }

  return (
    `🔗 *WALLET CONNECTED*\n\n` +
    `${walletEmoji} *Wallet:* ${escMd(wallet.walletType.charAt(0).toUpperCase() + wallet.walletType.slice(1))}\n` +
    `📬 *Address:* \`${addr}\`\n` +
    balanceText +
    `📋 *Short:* ${shortAddr}\n` +
    `${escMd(verifiedBadge)}\n` +
    `📅 *Connected:* ${escMd(connDate)}\n` +
    `🔑 *Session Keys:* ${(wallet.sessionKeys || []).length}\n\n` +
    `_Non\\-custodial — your keys, your control_`
  );
}

function walletConnectPrompt() {
  return (
    `🔗 *CONNECT WALLET*\n\n` +
    `Choose how to connect your Solana wallet:\n\n` +
    `👻 *Phantom* — Mobile deeplink\n` +
    `🔆 *Solflare* — Mobile deeplink\n` +
    `✍️ *Manual* — Paste your address\n\n` +
    `*Manual connection:*\n` +
    `\`/connect <your\\-wallet\\-address>\`\n\n` +
    `Example:\n` +
    `\`/connect 8xKm4pRtAoFE7qX...\``
  );
}

function walletConnected(address, walletType) {
  const walletEmoji = walletType === 'phantom' ? '👻' : 
                      walletType === 'solflare' ? '🔆' : '🔗';
  return (
    `${walletEmoji} *Wallet Connected\\!*\n\n` +
    `📬 *Address:* \`${escMd(address)}\`\n\n` +
    `⚡ *Next steps:*\n` +
    `1\\. Verify ownership: /verify\n` +
    `2\\. Create session keys: /createsession\n` +
    `3\\. View wallet info: /wallet\n\n` +
    `_Your wallet is non\\-custodial — Sentia never has access to your private keys\\._`
  );
}

function walletDisconnected(address) {
  return (
    `🔓 *Wallet Disconnected*\n\n` +
    `Address \`${escMd(address)}\` has been removed\\.\n` +
    `All session keys have been invalidated\\.\n\n` +
    `Use /connect to link a new wallet\\.`
  );
}

function verifyChallenge(challengeMessage) {
  return (
    `🔐 *VERIFY WALLET OWNERSHIP*\n\n` +
    `Sign this message in your wallet to prove ownership:\n\n` +
    `\`\`\`\n${escMd(challengeMessage)}\n\`\`\`\n\n` +
    `*How to verify:*\n` +
    `1\\. Copy the message above\n` +
    `2\\. Open Phantom/Solflare\n` +
    `3\\. Go to Settings → Sign Message\n` +
    `4\\. Paste \\& sign the message\n` +
    `5\\. Copy the signature \\(base58\\)\n` +
    `6\\. Send: \`/verifysig <signature>\`\n\n` +
    `_Challenge expires in 5 minutes_`
  );
}

function walletVerified() {
  return (
    `✅ *Wallet Verified\\!*\n\n` +
    `Your wallet ownership has been confirmed on\\-chain\\.\n` +
    `You now have full access to:\n\n` +
    `🔑 Create session keys for AI agents\n` +
    `💸 Approve/reject over\\-limit transactions\n` +
    `📊 View spending analytics\n` +
    `🔐 Set on\\-chain spending limits\n\n` +
    `Get started: /createsession`
  );
}

// ══════════════════════════════════════════════════════════════
//  SESSION KEYS / DELEGATED SIGNER
// ══════════════════════════════════════════════════════════════

function sessionKeyOverview(stats, keys) {
  let text = `🔑 *SESSION KEYS — DELEGATED SIGNER*\n\n`;
  text += `Session keys let you delegate *limited signing authority*\n`;
  text += `to AI agents without giving them your private key\\.\n\n`;
  text += `*📊 Overview:*\n`;
  text += `• Active Keys: *${stats.active}*\n`;
  text += `• Revoked: *${stats.revoked}*\n`;
  text += `• Expired: *${stats.expired}*\n`;
  text += `• Total Delegated Tx: *${stats.totalTx}*\n`;
  text += `• Total Delegated Spend: *$${escMd(String(stats.totalSpent.toFixed(2)))}*\n\n`;

  if (keys.length === 0) {
    text += `_No session keys yet\\._\n`;
    text += `Create one: /createsession\n`;
  } else {
    text += `*🔑 Active Keys:*\n\n`;
    keys.filter(k => k.status === 'active').forEach((k, i) => {
      const remaining = k.expiresAt - Date.now();
      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      text += `${i + 1}\\. 🤖 *${escMd(k.agentName)}* \\(\`${escMd(k.id)}\`\\)\n`;
      text += `   📬 \`${escMd(k.publicKey.slice(0, 8))}\\.\\.\\.\`\n`;
      text += `   💰 ${escMd(String(k.permissions.maxPerTx))} ${escMd(k.permissions.allowedTokens[0])}/tx \\| ${escMd(String(k.permissions.dailyLimit))}/day\n`;
      text += `   ⏱️ Expires: ${hours}h ${mins}m\n`;
      text += `   📝 Tx: ${k.usage.txCount} \\| Spent: $${escMd(String(k.usage.totalSpent.toFixed(2)))}\n\n`;
    });
  }

  text += `\n_On\\-chain enforced via Solana smart contracts_`;
  return text;
}

function sessionKeyCreated(session) {
  return (
    `✅ *SESSION KEY CREATED*\n\n` +
    `🔑 *ID:* \`${escMd(session.id)}\`\n` +
    `🤖 *Agent:* ${escMd(session.agentName)}\n` +
    `📬 *Public Key:* \`${escMd(session.publicKey)}\`\n\n` +
    `*⚙️ Permissions:*\n` +
    `• Max per\\-tx: ${escMd(String(session.permissions.maxPerTx))} ${escMd(session.permissions.allowedTokens[0])}\n` +
    `• Daily limit: ${escMd(String(session.permissions.dailyLimit))} ${escMd(session.permissions.allowedTokens[0])}\n` +
    `• Allowed tokens: ${escMd(session.permissions.allowedTokens.join(', '))}\n` +
    `• Expires in: ${session.expiryHours}h\n\n` +
    `*🔐 Secret Key \\(for agent\\):*\n` +
    `\`\`\`\n${escMd(session.secretKeyEncrypted)}\n\`\`\`\n\n` +
    `⚠️ *IMPORTANT:* Save the secret key now\\!\n` +
    `It will only be shown once\\.\n` +
    `Provide this to your AI agent for signing\\.\n\n` +
    `_The agent can now sign transactions within the\nconfigured limits\\. Any transaction exceeding\nlimits will require your manual approval\\._`
  );
}

function sessionKeyDetail(session) {
  const statusEmoji = session.status === 'active' ? '🟢' : 
                      session.status === 'revoked' ? '🔴' : '⚪';
  const remaining = session.expiresAt - Date.now();
  const hours = Math.max(0, Math.floor(remaining / 3600000));
  const mins = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const createdDate = new Date(session.createdAt).toLocaleString('id-ID');
  const dailyRemaining = session.permissions.dailyLimit - session.usage.todaySpent;

  return (
    `🔑 *SESSION KEY DETAIL*\n\n` +
    `*ID:* \`${escMd(session.id)}\`\n` +
    `*Status:* ${statusEmoji} ${escMd(session.status.charAt(0).toUpperCase() + session.status.slice(1))}\n` +
    `*Agent:* ${escMd(session.agentName)}\n` +
    `*Public Key:* \`${escMd(session.publicKey.slice(0, 16))}\\.\\.\\.\`\n` +
    `*Created:* ${escMd(createdDate)}\n` +
    `*Expires:* ${session.status === 'active' ? `${hours}h ${mins}m remaining` : escMd(session.status)}\n\n` +
    `*⚙️ Permissions:*\n` +
    `• Max per\\-tx: ${escMd(String(session.permissions.maxPerTx))} ${escMd(session.permissions.allowedTokens[0])}\n` +
    `• Daily limit: ${escMd(String(session.permissions.dailyLimit))} ${escMd(session.permissions.allowedTokens[0])}\n` +
    `• Allowed tokens: ${escMd(session.permissions.allowedTokens.join(', '))}\n\n` +
    `*📊 Usage:*\n` +
    `• Total spent: $${escMd(String(session.usage.totalSpent.toFixed(2)))}\n` +
    `• Today spent: $${escMd(String(session.usage.todaySpent.toFixed(2)))}\n` +
    `• Daily remaining: $${escMd(String(Math.max(0, dailyRemaining).toFixed(2)))}\n` +
    `• Transactions: ${session.usage.txCount}\n\n` +
    `_On\\-chain delegated signer \\| Non\\-custodial_`
  );
}

function sessionKeyRevoked(agentName) {
  return (
    `🔴 *Session Key Revoked*\n\n` +
    `The session key for *${escMd(agentName)}* has been revoked\\.\n` +
    `The agent can no longer sign transactions\\.\n\n` +
    `_Revocation is immediate and on\\-chain enforced\\._`
  );
}

function allSessionsRevoked(count) {
  return `🔴 *${count} session keys* have been revoked\\.\nAll agents are now unauthorized\\.`;
}

function createSessionPrompt() {
  return (
    `🔑 *CREATE SESSION KEY*\n\n` +
    `Configure a new delegated signer for your AI agent\\.\n\n` +
    `*Quick create \\(defaults\\):*\n` +
    `\`/createsession <agent\\-name>\`\n\n` +
    `*Custom \\(full config\\):*\n` +
    `\`/newsession <name> <maxPerTx> <dailyLimit> <hours>\`\n\n` +
    `*Examples:*\n` +
    `\`/createsession TradingBot\`\n` +
    `→ 10 USDC/tx, 100/day, 24h expiry\n\n` +
    `\`/newsession DeFiAgent 25 500 48\`\n` +
    `→ 25 USDC/tx, 500/day, 48h expiry\n\n` +
    `_Each session key generates a real Ed25519\nSolana keypair for on\\-chain signing\\._`
  );
}

function delegatedTxSuccess(result) {
  return (
    `✅ *DELEGATED TX — APPROVED*\n\n` +
    `🤖 *Agent:* ${escMd(result.agentName)}\n` +
    `💰 *Amount:* ${escMd(String(result.amount))} ${escMd(result.token)}\n` +
    `📋 *Tx ID:* \`${escMd(result.txId)}\`\n` +
    `💳 *Daily Remaining:* $${escMd(String(result.remainingDaily.toFixed(2)))}\n\n` +
    `_Signed by session key — within limits_`
  );
}

function delegatedTxRejected(error, needsApproval) {
  if (needsApproval) {
    return (
      `⚠️ *APPROVAL REQUIRED*\n\n` +
      `❌ ${escMd(error)}\n\n` +
      `This transaction *exceeds the session key limits*\\.\n` +
      `As the wallet owner, you can:\n\n` +
      `✅ Manually approve this transaction\n` +
      `🔧 Increase the session key limits\n` +
      `🔑 Create a new key with higher limits`
    );
  }
  return `❌ *Delegated TX Failed*\n\n${escMd(error)}`;
}

function delegatedSignerExplainer() {
  return (
    `🔐 *HOW SESSION KEYS WORK*\n\n` +
    `*The Problem:*\n` +
    `AI agents need to sign transactions, but giving\nthem your private key is dangerous\\.\n\n` +
    `*The Solution: Delegated Signers*\n\n` +
    `1️⃣ *Generate* — Owner creates a temporary Ed25519 keypair\n` +
    `2️⃣ *Delegate* — On\\-chain record grants the key limited authority\n` +
    `3️⃣ *Restrict* — Set per\\-tx, daily limits, token types, expiry\n` +
    `4️⃣ *Agent Signs* — Agent uses session key to sign within limits\n` +
    `5️⃣ *Verify* — Smart contract checks if key is authorized \\+ within limits\n` +
    `6️⃣ *Escalate* — Over\\-limit txs trigger owner approval via Telegram\n` +
    `7️⃣ *Revoke* — Owner can revoke any session key instantly\n\n` +
    `*🔒 Security Guarantees:*\n` +
    `• Your private key is *never* shared\n` +
    `• Session keys have *limited authority*\n` +
    `• Limits enforced *on\\-chain* \\(can't be bypassed\\)\n` +
    `• Instant revocation\n` +
    `• Full audit trail\n\n` +
    `_This is the Sentia approach to agent finance:\nhuman control \\+ agent autonomy\\._`
  );
}

module.exports = {
  escMd,
  welcome,
  mainMenu,
  agentsList,
  agentDetail,
  transactionsList,
  transactionDetail,
  spendingLimits,
  pendingApprovals,
  approvalNotification,
  analytics,
  sdkGuide,
  webhookFlow,
  pricing,
  help,
  about,
  links,
  integrations,
  systemStatus,
  profile,
  adminPanel,
  errorMsg,
  rateLimited,
  approvedMsg,
  rejectedMsg,
  // Wallet
  walletMenu,
  walletConnectPrompt,
  walletConnected,
  walletDisconnected,
  verifyChallenge,
  walletVerified,
  // Session Keys
  sessionKeyOverview,
  sessionKeyCreated,
  sessionKeyDetail,
  sessionKeyRevoked,
  allSessionsRevoked,
  createSessionPrompt,
  delegatedTxSuccess,
  delegatedTxRejected,
  delegatedSignerExplainer,
};
