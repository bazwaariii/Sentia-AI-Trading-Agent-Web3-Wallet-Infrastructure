// ============================================================
// Logger Utility - Colored console logging
// ============================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

const logger = {
  info(msg, ...args) {
    console.log(`${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.blue}INFO${COLORS.reset}  ${msg}`, ...args);
  },

  success(msg, ...args) {
    console.log(`${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.green}OK${COLORS.reset}    ${msg}`, ...args);
  },

  warn(msg, ...args) {
    console.log(`${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}WARN${COLORS.reset}  ${msg}`, ...args);
  },

  error(msg, ...args) {
    console.log(`${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.red}ERROR${COLORS.reset} ${msg}`, ...args);
  },

  cmd(user, command) {
    console.log(
      `${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.magenta}CMD${COLORS.reset}   ` +
      `${COLORS.bright}@${user}${COLORS.reset} → ${COLORS.yellow}${command}${COLORS.reset}`
    );
  },

  bot(msg) {
    console.log(
      `${COLORS.cyan}[${timestamp()}]${COLORS.reset} ${COLORS.green}BOT${COLORS.reset}   ${msg}`
    );
  },
};

module.exports = logger;
