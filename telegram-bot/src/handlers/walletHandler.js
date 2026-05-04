// ============================================================
// Wallet Handler - Phantom & Solflare Connection
// ============================================================

const { Keypair, PublicKey } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const Storage = require('../utils/storage');
const logger = require('../utils/logger');

const walletStorage = new Storage('wallets.json');

// Map of pending verification challenges: userId -> { nonce, timestamp }
const pendingVerifications = new Map();

// ── Validate a Solana address ───────────────────────────────
function isValidSolanaAddress(address) {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBytes());
  } catch {
    return false;
  }
}

// ── Connect wallet (manual address entry) ───────────────────
function connectWallet(userId, address, walletType = 'manual') {
  if (!isValidSolanaAddress(address)) {
    return { success: false, error: 'Invalid Solana address' };
  }

  const existing = walletStorage.get(String(userId));
  if (existing && existing.address === address) {
    return { success: false, error: 'This wallet is already connected' };
  }

  walletStorage.set(String(userId), {
    address,
    walletType, // 'phantom', 'solflare', 'manual'
    connectedAt: Date.now(),
    verified: false,
    sessionKeys: [],
  });

  logger.success(`Wallet connected for user ${userId}: ${address.slice(0, 8)}...${address.slice(-4)} (${walletType})`);
  return { success: true };
}

// ── Generate verification challenge ─────────────────────────
function generateChallenge(userId) {
  const nonce = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  const message = `Sentia Wallet Verification\n\nSign this message to verify ownership.\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
  
  pendingVerifications.set(String(userId), {
    nonce,
    message,
    timestamp: Date.now(),
  });

  return message;
}

// ── Verify wallet signature ─────────────────────────────────
function verifySignature(userId, signatureBase58) {
  const wallet = walletStorage.get(String(userId));
  const challenge = pendingVerifications.get(String(userId));
  
  if (!wallet) return { success: false, error: 'No wallet connected' };
  if (!challenge) return { success: false, error: 'No pending verification' };
  
  // Check challenge expiry (5 minutes)
  if (Date.now() - challenge.timestamp > 5 * 60 * 1000) {
    pendingVerifications.delete(String(userId));
    return { success: false, error: 'Verification expired. Generate a new challenge with /verify' };
  }

  try {
    const bs58 = require('bs58');
    const signature = bs58.decode(signatureBase58);
    const publicKey = new PublicKey(wallet.address);
    const messageBytes = new TextEncoder().encode(challenge.message);
    
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signature,
      publicKey.toBytes()
    );

    if (verified) {
      wallet.verified = true;
      wallet.verifiedAt = Date.now();
      walletStorage.set(String(userId), wallet);
      pendingVerifications.delete(String(userId));
      logger.success(`Wallet verified for user ${userId}`);
      return { success: true };
    } else {
      return { success: false, error: 'Signature verification failed' };
    }
  } catch (err) {
    return { success: false, error: `Verification error: ${err.message}` };
  }
}

// ── Disconnect wallet ───────────────────────────────────────
function disconnectWallet(userId) {
  const wallet = walletStorage.get(String(userId));
  if (!wallet) return { success: false, error: 'No wallet connected' };
  
  walletStorage.delete(String(userId));
  logger.info(`Wallet disconnected for user ${userId}`);
  return { success: true, address: wallet.address };
}

// ── Get wallet info ─────────────────────────────────────────
function getWallet(userId) {
  return walletStorage.get(String(userId), null);
}

// ── Check if wallet is connected ────────────────────────────
function isConnected(userId) {
  return walletStorage.has(String(userId));
}

// ── Format wallet address ───────────────────────────────────
function shortAddress(address) {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// ── Generate Phantom deeplink ───────────────────────────────
function getPhantomDeeplink(botUsername) {
  // Phantom mobile deeplink for Solana connect
  const params = new URLSearchParams({
    app_url: 'https://sentia.dev',
    redirect_link: `https://t.me/${botUsername}`,
    cluster: 'mainnet-beta',
  });
  return `https://phantom.app/ul/v1/connect?${params.toString()}`;
}

// ── Generate Solflare deeplink ──────────────────────────────
function getSolflareDeeplink(botUsername) {
  return `https://solflare.com/ul/v1/connect?app_url=https://sentia.dev&redirect_link=https://t.me/${botUsername}&cluster=mainnet-beta`;
}

module.exports = {
  isValidSolanaAddress,
  connectWallet,
  generateChallenge,
  verifySignature,
  disconnectWallet,
  getWallet,
  isConnected,
  shortAddress,
  getPhantomDeeplink,
  getSolflareDeeplink,
};
