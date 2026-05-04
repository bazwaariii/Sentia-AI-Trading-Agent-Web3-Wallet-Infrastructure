// ============================================================
// User Handler - Profile & Stats for Sentia Agent Wallet
// ============================================================

const Storage = require('../utils/storage');
const logger = require('../utils/logger');

const userStorage = new Storage('users.json');

// ── Track user activity ────────────────────────────────────
function trackUser(user) {
  const userId = String(user.id);
  const existing = userStorage.get(userId, null);

  if (!existing) {
    // New user
    userStorage.set(userId, {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      languageCode: user.language_code || 'id',
      joinDate: Date.now(),
      messageCount: 0,
      commandCount: 0,
      lastActive: Date.now(),
    });
    logger.success(`New user registered: @${user.username || user.first_name} (${user.id})`);
    return true; // is new
  }

  // Update existing user info
  existing.firstName = user.first_name;
  existing.lastName = user.last_name || '';
  existing.username = user.username || '';
  existing.lastActive = Date.now();
  userStorage.set(userId, existing);
  return false; // not new
}

// ── Increment message count ────────────────────────────────
function incrementMessages(userId) {
  const data = userStorage.get(String(userId));
  if (!data) return;
  data.messageCount++;
  data.lastActive = Date.now();
  userStorage.set(String(userId), data);
}

// ── Increment command count ─────────────────────────────────
function incrementCommands(userId) {
  const data = userStorage.get(String(userId));
  if (!data) return;
  data.commandCount++;
  userStorage.set(String(userId), data);
}

// ── Get user stats ──────────────────────────────────────────
function getUserStats(userId) {
  return userStorage.get(String(userId), {
    joinDate: Date.now(),
    messageCount: 0,
    commandCount: 0,
    noteCount: 0,
  });
}

// ── Get global stats ────────────────────────────────────────
function getGlobalStats(startTime) {
  const allUsers = userStorage.getAll();
  const totalUsers = Object.keys(allUsers).length;
  const totalMessages = Object.values(allUsers).reduce((sum, u) => sum + (u.messageCount || 0), 0);
  
  const uptimeMs = Date.now() - startTime;
  const hours = Math.floor(uptimeMs / 3600000);
  const minutes = Math.floor((uptimeMs % 3600000) / 60000);
  const uptime = `${hours}h ${minutes}m`;

  const memUsage = process.memoryUsage();
  const memory = `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`;

  return { totalUsers, totalMessages, uptime, memory };
}

// ── Get user settings ───────────────────────────────────────
function getUserSettings(userId) {
  const data = userStorage.get(String(userId));
  return data?.settings || { language: 'id', notifications: true };
}

// ── Update user settings ────────────────────────────────────
function updateSettings(userId, key, value) {
  const data = userStorage.get(String(userId));
  if (!data) return;
  if (!data.settings) data.settings = {};
  data.settings[key] = value;
  userStorage.set(String(userId), data);
}

// ── Get all user IDs (for broadcast) ────────────────────────
function getAllUserIds() {
  return Object.keys(userStorage.getAll()).map(Number);
}

module.exports = {
  trackUser,
  incrementMessages,
  incrementCommands,
  getUserStats,
  getGlobalStats,
  getUserSettings,
  updateSettings,
  getAllUserIds,
};
