const fs = require('fs');
let c = fs.readFileSync('src/bot.js', 'utf8');

const oldHandler = `// ── /wallet ─────────────────────────────────────────────────
bot.onText(/\\/(wallet)|(🔗 Wallet)/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/wallet');
  userHandler.incrementCommands(msg.from.id);

  try {
    const axios = require('axios');
    const response = await axios.get(\`http://localhost:3000/api/telegram/dashboard/\${msg.chat.id}\`);

    if (response.data.user) {
      const user = response.data.user;
      const balance = response.data.solBalance || 0;

      let text = \`👛 *Wallet Information*\\\\n\\\\n\`;
      text += \`👤 *User:* \${messages.escMd(user.name)}\\\\n\`;
      text += \`📬 *Address:* \\\\\`\${messages.escMd(user.walletAddress)}\\\\\`\\\\n\`;
      text += \`💰 *Balance:* \\\\\`\${balance.toFixed(4)} SOL\\\\\`\\\\n\\\\n\`;
      text += \`_Wallet ini terintegrasi langsung dengan Dashboard Sentia Anda\\\\\\\\._\`;

      send(msg.chat.id, text, kb.inlineKeyboard(
        [kb.btn('🔑 Session Keys', 'view_sessionkeys')],
        [kb.urlBtn('🌐 View on Solscan', \`https://solscan.io/account/\${user.walletAddress}?cluster=devnet\`)]
      ));
    } else {
      send(msg.chat.id, "❌ *Wallet Tidak Ditemukan*\\nSilakan ketik menu '🔗 Link Web Account' untuk sinkronisasi wallet dari web\\\\\\\\.");
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal mengambil data wallet dari server\\\\\\\\.*");
  }
});`;

const newHandler = `// ── /wallet ─────────────────────────────────────────────────
// NOTE: Only matches /wallet command, NOT the reply keyboard button
// The reply keyboard "🔗 Wallet" button is handled in the switch statement below
bot.onText(/\\/(wallet)$/, async (msg) => {
  logger.cmd(msg.from.username || msg.from.first_name, '/wallet');
  userHandler.incrementCommands(msg.from.id);

  // Must be logged in (have wallet data linked via login)
  const w = walletHandler.getWallet(msg.from.id);
  if (!w) {
    loginState.set(msg.from.id, { step: 'email' });
    bot.sendMessage(msg.chat.id, \`🔐 *Akses Ditolak*\\n\\nAnda harus login ke akun web Sentia untuk menggunakan Wallet.\\n\\n📧 Masukkan **Email** Anda:\`, { parse_mode: 'Markdown' });
    return;
  }

  try {
    const axios = require('axios');
    const response = await axios.get(\`http://localhost:3000/api/telegram/dashboard/\${msg.chat.id}\`);

    if (response.data.user) {
      const user = response.data.user;
      const balance = response.data.solBalance || 0;

      let text = \`👛 *Wallet Information*\\\\n\\\\n\`;
      text += \`👤 *User:* \${messages.escMd(user.name)}\\\\n\`;
      text += \`📬 *Address:* \\\\\`\${messages.escMd(user.walletAddress)}\\\\\`\\\\n\`;
      text += \`💰 *Balance:* \\\\\`\${balance.toFixed(4)} SOL\\\\\`\\\\n\\\\n\`;
      text += \`_Wallet ini terintegrasi langsung dengan Dashboard Sentia Anda\\\\\\\\._\`;

      send(msg.chat.id, text, kb.inlineKeyboard(
        [kb.btn('🔑 Session Keys', 'view_sessionkeys')],
        [kb.urlBtn('🌐 View on Solscan', \`https://solscan.io/account/\${user.walletAddress}?cluster=devnet\`)],
        [kb.btn('🚪 Logout', 'confirm_logout')]
      ));
    } else {
      send(msg.chat.id, "❌ *Wallet Tidak Ditemukan*\\nSilakan ketik menu '🔗 Link Web Account' untuk sinkronisasi wallet dari web\\\\\\\\.");
    }
  } catch (error) {
    send(msg.chat.id, "❌ *Gagal mengambil data wallet dari server\\\\\\\\.*");
  }
});`;

if (c.includes(oldHandler)) {
  c = c.replace(oldHandler, newHandler);
  fs.writeFileSync('src/bot.js', c);
  console.log('SUCCESS: /wallet handler updated');
} else {
  // Try finding just the regex line
  const idx = c.indexOf('bot.onText(/\\/(wallet)|(🔗 Wallet)/');
  if (idx >= 0) {
    console.log('Found regex at index:', idx);
    // Simple replacement of the regex pattern only
    c = c.replace('bot.onText(/\\/(wallet)|(🔗 Wallet)/', 'bot.onText(/\\/(wallet)$/');
    fs.writeFileSync('src/bot.js', c);
    console.log('SUCCESS: regex pattern fixed (minimal)');
  } else {
    console.log('FAIL: Could not find handler');
    // Show surrounding content
    const walletIdx = c.indexOf('/wallet');
    console.log('First /wallet at index:', walletIdx);
  }
}
