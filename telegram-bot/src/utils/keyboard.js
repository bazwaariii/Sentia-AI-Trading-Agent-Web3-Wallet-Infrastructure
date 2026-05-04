// ============================================================
// Sentia Agent Wallet - Keyboard Layouts
// ============================================================

/**
 * Creates an inline keyboard button
 */
function btn(text, callbackData) {
  return { text, callback_data: callbackData };
}

/**
 * Creates a URL button
 */
function urlBtn(text, url) {
  return { text, url };
}

/**
 * Creates an inline keyboard markup from rows of buttons
 */
function inlineKeyboard(...rows) {
  return {
    reply_markup: {
      inline_keyboard: rows.filter(r => r.length > 0),
    },
  };
}

/**
 * Creates a reply keyboard markup
 */
function replyKeyboard(rows, resize = true, oneTime = false) {
  return {
    reply_markup: {
      keyboard: rows.map(row => row.map(text => ({ text }))),
      resize_keyboard: resize,
      one_time_keyboard: oneTime,
    },
  };
}

/**
 * Removes reply keyboard
 */
function removeKeyboard() {
  return {
    reply_markup: {
      remove_keyboard: true,
    },
  };
}

// ── Pre-built keyboard layouts for Sentia ───────────────────

const MAIN_MENU_KEYBOARD = replyKeyboard([
  ['📝 Chat AI', '📡 Market Scan'],
  ['🔥 Trending', '🔗 Wallet'],
  ['🤖 My Agents', '💸 Transactions'],
  ['🔐 Spending Limits', '🔔 Approvals'],
  ['📊 Analytics', '🌐 Web Dashboard'],
  ['🔗 Link Web Account', '❓ Help']
]);

const BACK_TO_MENU_KEYBOARD = replyKeyboard([
  ['🔙 Back to Menu'],
]);

module.exports = {
  btn,
  urlBtn,
  inlineKeyboard,
  replyKeyboard,
  removeKeyboard,
  MAIN_MENU_KEYBOARD,
  BACK_TO_MENU_KEYBOARD,
};
