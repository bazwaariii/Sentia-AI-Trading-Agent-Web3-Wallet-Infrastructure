// ============================================================
// Reminder Handler - Timer-based reminders
// ============================================================

const messages = require('../utils/messages');
const logger = require('../utils/logger');

// Active reminders in memory (not persisted across restarts)
const activeReminders = new Map();

// ── Set a reminder ──────────────────────────────────────────
function setReminder(bot, chatId, userId, minutes, message) {
  const timeoutId = setTimeout(() => {
    bot.sendMessage(chatId, messages.reminderFired(message), { parse_mode: 'MarkdownV2' })
      .catch(err => logger.error(`Failed to send reminder: ${err.message}`));
    
    // Remove from active reminders
    const userReminders = activeReminders.get(String(userId)) || [];
    const idx = userReminders.findIndex(r => r.timeoutId === timeoutId);
    if (idx !== -1) userReminders.splice(idx, 1);
    if (userReminders.length === 0) activeReminders.delete(String(userId));
    else activeReminders.set(String(userId), userReminders);
  }, minutes * 60 * 1000);

  // Store
  const userReminders = activeReminders.get(String(userId)) || [];
  userReminders.push({
    message,
    minutes,
    setAt: Date.now(),
    firesAt: Date.now() + minutes * 60 * 1000,
    timeoutId,
  });
  activeReminders.set(String(userId), userReminders);

  logger.info(`Reminder set for user ${userId}: "${message}" in ${minutes}m`);
}

// ── Get active reminders for a user ─────────────────────────
function getReminders(userId) {
  const reminders = activeReminders.get(String(userId)) || [];
  return reminders.map((r, i) => ({
    index: i + 1,
    message: r.message,
    remainingMs: Math.max(0, r.firesAt - Date.now()),
    remainingMin: Math.max(0, Math.ceil((r.firesAt - Date.now()) / 60000)),
  }));
}

// ── Format reminders list ───────────────────────────────────
function formatReminders(userId) {
  const reminders = getReminders(userId);
  
  if (reminders.length === 0) {
    return '⏰ *Pengingat Aktif*\n\n_Tidak ada pengingat aktif\\._\n\nGunakan: `/reminder <menit> <pesan>`';
  }

  let text = `⏰ *Pengingat Aktif* \\(${reminders.length}\\)\n\n`;
  reminders.forEach(r => {
    text += `${r.index}\\. 📝 ${messages.escMd(r.message)}\n`;
    text += `   _⏱️ ${r.remainingMin} menit lagi_\n\n`;
  });
  return text;
}

module.exports = {
  setReminder,
  getReminders,
  formatReminders,
};
