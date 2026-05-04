// ============================================================
// Session Key Handler - Delegated Signer for AI Agents
// ============================================================
//
// Session Keys allow wallet owners to delegate limited signing
// authority to AI agents. Each session key:
//   - Is a real Ed25519 Solana keypair
//   - Has spending limits (per-tx, daily)
//   - Has token restrictions
//   - Has an expiry time
//   - Can be revoked at any time
//
// The AI agent receives the session key's private key and can
// sign transactions within the delegated permissions on-chain.
// ============================================================

const { Keypair } = require('@solana/web3.js');
const Storage = require('../utils/storage');
const logger = require('../utils/logger');
const config = require('../config');

const sessionStorage = new Storage('session_keys.json');

// ── Generate unique session ID ──────────────────────────────
function generateSessionId() {
  return 'sk_' + Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// ── Create Session Key ──────────────────────────────────────
function createSessionKey(userId, agentName, options = {}) {
  const {
    maxPerTx = 10,        // USDC
    dailyLimit = 100,     // USDC
    allowedTokens = ['USDC', 'SOL'],
    expiryHours = 24,
    allowedPrograms = [], // Specific Solana programs
    description = '',
  } = options;

  // Generate a real Solana keypair
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString('base64');

  const sessionId = generateSessionId();
  const now = Date.now();

  const sessionKey = {
    id: sessionId,
    agentName,
    publicKey,
    secretKeyEncrypted: secretKey, // In production, encrypt with owner's key
    permissions: {
      maxPerTx,
      dailyLimit,
      allowedTokens,
      allowedPrograms,
    },
    createdAt: now,
    expiresAt: now + (expiryHours * 60 * 60 * 1000),
    expiryHours,
    status: 'active',     // active, expired, revoked
    description,
    // Usage tracking
    usage: {
      totalSpent: 0,
      todaySpent: 0,
      txCount: 0,
      lastTxAt: null,
      lastResetDate: new Date().toDateString(),
    },
  };

  // Store under userId
  const userSessions = sessionStorage.get(String(userId), []);
  userSessions.push(sessionKey);
  sessionStorage.set(String(userId), userSessions);

  logger.success(`Session key created: ${sessionId} for agent "${agentName}" (user ${userId})`);
  return sessionKey;
}

// ── Get all session keys for a user ─────────────────────────
function getSessionKeys(userId) {
  const sessions = sessionStorage.get(String(userId), []);
  // Auto-expire sessions
  const now = Date.now();
  let changed = false;
  sessions.forEach(s => {
    if (s.status === 'active' && now > s.expiresAt) {
      s.status = 'expired';
      changed = true;
    }
  });
  if (changed) sessionStorage.set(String(userId), sessions);
  return sessions;
}

// ── Get active session keys ─────────────────────────────────
function getActiveKeys(userId) {
  return getSessionKeys(userId).filter(s => s.status === 'active');
}

// ── Get session key by ID ───────────────────────────────────
function getSessionById(userId, sessionId) {
  const sessions = getSessionKeys(userId);
  return sessions.find(s => s.id === sessionId) || null;
}

// ── Revoke a session key ────────────────────────────────────
function revokeSessionKey(userId, sessionId) {
  const sessions = getSessionKeys(userId);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return { success: false, error: 'Session key not found' };
  if (session.status === 'revoked') return { success: false, error: 'Already revoked' };

  session.status = 'revoked';
  session.revokedAt = Date.now();
  sessionStorage.set(String(userId), sessions);
  
  logger.info(`Session key revoked: ${sessionId} (user ${userId})`);
  return { success: true, agentName: session.agentName };
}

// ── Revoke all session keys ─────────────────────────────────
function revokeAll(userId) {
  const sessions = getSessionKeys(userId);
  let count = 0;
  sessions.forEach(s => {
    if (s.status === 'active') {
      s.status = 'revoked';
      s.revokedAt = Date.now();
      count++;
    }
  });
  sessionStorage.set(String(userId), sessions);
  logger.info(`All session keys revoked for user ${userId} (${count} keys)`);
  return count;
}

// ── Simulate agent transaction with session key ─────────────
function simulateTransaction(userId, sessionId, amount, token = 'USDC') {
  const sessions = getSessionKeys(userId);
  const session = sessions.find(s => s.id === sessionId);

  if (!session) return { success: false, error: 'Session key not found' };
  if (session.status !== 'active') return { success: false, error: `Session key is ${session.status}` };
  if (Date.now() > session.expiresAt) {
    session.status = 'expired';
    sessionStorage.set(String(userId), sessions);
    return { success: false, error: 'Session key expired' };
  }

  // Check permissions
  if (!session.permissions.allowedTokens.includes(token)) {
    return { success: false, error: `Token ${token} not allowed. Allowed: ${session.permissions.allowedTokens.join(', ')}` };
  }
  if (amount > session.permissions.maxPerTx) {
    return { 
      success: false, 
      error: `Amount ${amount} exceeds per-tx limit of ${session.permissions.maxPerTx} ${token}`,
      needsApproval: true,
    };
  }

  // Reset daily counter if new day
  const today = new Date().toDateString();
  if (session.usage.lastResetDate !== today) {
    session.usage.todaySpent = 0;
    session.usage.lastResetDate = today;
  }

  if (session.usage.todaySpent + amount > session.permissions.dailyLimit) {
    return { 
      success: false, 
      error: `Would exceed daily limit of ${session.permissions.dailyLimit} ${token} (today: ${session.usage.todaySpent})`,
      needsApproval: true,
    };
  }

  // Transaction approved by session key!
  session.usage.totalSpent += amount;
  session.usage.todaySpent += amount;
  session.usage.txCount++;
  session.usage.lastTxAt = Date.now();
  sessionStorage.set(String(userId), sessions);

  const txId = 'tx_' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  // Expose to frontend via DEMO_TRANSACTIONS state
  config.DEMO_TRANSACTIONS.unshift({
    id: txId,
    agent: session.agentName,
    type: 'Trading Execution',
    amount: amount,
    token: token,
    status: 'approved',
    time: 'Just now',
    to: 'Solana Dex',
  });

  return {
    success: true,
    txId: txId,
    amount,
    token,
    agentName: session.agentName,
    remainingDaily: session.permissions.dailyLimit - session.usage.todaySpent,
  };
}

// ── Get aggregate stats ─────────────────────────────────────
function getKeyStats(userId) {
  const sessions = getSessionKeys(userId);
  const active = sessions.filter(s => s.status === 'active');
  const totalSpent = sessions.reduce((sum, s) => sum + s.usage.totalSpent, 0);
  const totalTx = sessions.reduce((sum, s) => sum + s.usage.txCount, 0);

  return {
    total: sessions.length,
    active: active.length,
    revoked: sessions.filter(s => s.status === 'revoked').length,
    expired: sessions.filter(s => s.status === 'expired').length,
    totalSpent,
    totalTx,
  };
}

// ── Format time remaining ───────────────────────────────────
function timeRemaining(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

module.exports = {
  createSessionKey,
  getSessionKeys,
  getActiveKeys,
  getSessionById,
  revokeSessionKey,
  revokeAll,
  simulateTransaction,
  getKeyStats,
  timeRemaining,
};
