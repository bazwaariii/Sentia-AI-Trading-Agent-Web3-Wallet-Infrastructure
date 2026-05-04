// ============================================================
// Tools Handler - Calculator, Coin Flip, Dice Roll, etc.
// ============================================================

const messages = require('../utils/messages');

// ── Safe calculator (no eval) ───────────────────────────────
function calculate(expression) {
  try {
    // Sanitize: only allow numbers, operators, parentheses, decimal points, spaces
    const sanitized = expression.replace(/\s/g, '');
    if (!/^[\d+\-*/().%^]+$/.test(sanitized)) {
      return { error: 'Ekspresi tidak valid. Gunakan angka dan operator (+, -, *, /, %, ^)' };
    }

    // Replace ^ with ** for power
    const jsExpr = sanitized.replace(/\^/g, '**');

    // Use Function constructor instead of eval for slightly safer execution
    const result = new Function(`return (${jsExpr})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      return { error: 'Hasil tidak valid (infinity atau NaN)' };
    }

    // Round to avoid floating point issues
    const rounded = Math.round(result * 1e10) / 1e10;
    return { result: rounded };
  } catch (err) {
    return { error: `Gagal menghitung: ${err.message}` };
  }
}

// ── Coin flip ───────────────────────────────────────────────
function flipCoin() {
  return Math.random() < 0.5 ? 'Heads' : 'Tails';
}

// ── Dice roll ───────────────────────────────────────────────
function rollDice(sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

// ── Random number ───────────────────────────────────────────
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  calculate,
  flipCoin,
  rollDice,
  randomNumber,
};
