// ============================================================
//  Sentia — Dexscreener Market Analyzer
//  Adapted from Crypto Market Research: Patterned Dataset,
//  Clustering, and Decision Making for BUY/SELL Signals
// ============================================================

const axios = require('axios');
const logger = require('../utils/logger');

const DEX_BASE = 'https://api.dexscreener.com';
const CACHE_TTL = 30_000; // 30s cache
const pairCache = new Map();

// ── 1. DATA LAYER — Fetch Patterned Dataset from Dexscreener ─

/**
 * Fetch token pairs from Dexscreener for a given search query on Solana.
 * Returns normalized "Patterned Dataset" rows with:
 *   volume5m, volume1h, volume6h, volume24h, liquidity,
 *   priceChange5m, priceChange1h, priceChange6h, priceChange24h,
 *   fdv, marketCap, priceUsd, txns
 */
async function fetchTokenData(query) {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = pairCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await axios.get(`${DEX_BASE}/latest/dex/search`, {
      params: { q: query },
      timeout: 8000,
    });

    const pairs = (res.data?.pairs || [])
      .filter(p => p.chainId === 'solana' && p.liquidity?.usd > 0)
      .slice(0, 20);

    const dataset = pairs.map(normalizePair);
    pairCache.set(cacheKey, { data: dataset, ts: Date.now() });
    return dataset;
  } catch (err) {
    logger.error(`Dexscreener fetch error: ${err.message}`);
    return [];
  }
}

/**
 * Fetch by specific token address on Solana.
 */
async function fetchByAddress(address) {
  const cacheKey = `addr:${address}`;
  const cached = pairCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await axios.get(
      `${DEX_BASE}/token-pairs/v1/solana/${address}`,
      { timeout: 8000 }
    );
    const pairs = (res.data || []).filter(p => p.liquidity?.usd > 0).slice(0, 10);
    const dataset = pairs.map(normalizePair);
    pairCache.set(cacheKey, { data: dataset, ts: Date.now() });
    return dataset;
  } catch (err) {
    logger.error(`Dexscreener address fetch error: ${err.message}`);
    return [];
  }
}

/** Normalize a raw Dexscreener pair into our patterned dataset row. */
function normalizePair(p) {
  const vol = p.volume || {};
  const pc = p.priceChange || {};
  const tx = p.txns || {};
  const tx5m = tx.m5 || { buys: 0, sells: 0 };
  const tx1h = tx.h1 || { buys: 0, sells: 0 };
  const tx24h = tx.h24 || { buys: 0, sells: 0 };

  return {
    pairAddress: p.pairAddress,
    dex: p.dexId,
    baseToken: p.baseToken?.symbol || '???',
    baseTokenName: p.baseToken?.name || '???',
    baseTokenAddress: p.baseToken?.address || '',
    quoteToken: p.quoteToken?.symbol || '???',
    priceUsd: parseFloat(p.priceUsd) || 0,

    // Volume features
    volume5m: vol.m5 || 0,
    volume1h: vol.h1 || 0,
    volume6h: vol.h6 || 0,
    volume24h: vol.h24 || 0,

    // Price change features (%)
    priceChange5m: pc.m5 || 0,
    priceChange1h: pc.h1 || 0,
    priceChange6h: pc.h6 || 0,
    priceChange24h: pc.h24 || 0,

    // Liquidity & valuation
    liquidity: p.liquidity?.usd || 0,
    fdv: p.fdv || 0,
    marketCap: p.marketCap || 0,

    // Transaction counts
    txBuys5m: tx5m.buys,
    txSells5m: tx5m.sells,
    txBuys1h: tx1h.buys,
    txSells1h: tx1h.sells,
    txBuys24h: tx24h.buys,
    txSells24h: tx24h.sells,

    // Metadata
    pairUrl: p.url || `https://dexscreener.com/solana/${p.pairAddress}`,
    pairCreatedAt: p.pairCreatedAt,
  };
}

// ── 2. FEATURE ENGINEERING — Derived Metrics ─────────────────

function computeFeatures(row) {
  const {
    volume5m, volume1h, volume24h, liquidity, fdv,
    priceChange5m, priceChange1h, priceChange24h,
    txBuys5m, txSells5m, txBuys1h, txSells1h,
  } = row;

  // Volume acceleration: is 5m volume unusually high vs 1h average?
  const avg5mIn1h = volume1h > 0 ? volume1h / 12 : 0;
  const volumeAccel = avg5mIn1h > 0 ? volume5m / avg5mIn1h : 0;

  // Volume-to-liquidity ratio (measures trading intensity)
  const volLiqRatio = liquidity > 0 ? volume1h / liquidity : 0;

  // FDV-to-liquidity ratio (measures valuation stretch)
  const fdvLiqRatio = liquidity > 0 ? fdv / liquidity : 999;

  // Buy pressure (ratio of buys to total txns in 5m window)
  const totalTx5m = txBuys5m + txSells5m;
  const buyPressure5m = totalTx5m > 0 ? txBuys5m / totalTx5m : 0.5;

  const totalTx1h = txBuys1h + txSells1h;
  const buyPressure1h = totalTx1h > 0 ? txBuys1h / totalTx1h : 0.5;

  // Price momentum consistency (are 5m and 1h both positive?)
  const momentumAlign = (priceChange5m > 0 && priceChange1h > 0) ? 1
    : (priceChange5m < 0 && priceChange1h < 0) ? -1 : 0;

  // Crash indicator: sharp 5m drop while 1h was positive (reversal)
  const crashSignal = (priceChange5m < -5 && priceChange1h > 0) ? true : false;

  // Pump indicator: sharp 5m spike with volume surge
  const pumpSignal = (priceChange5m > 3 && volumeAccel > 2) ? true : false;

  return {
    ...row,
    volumeAccel: round(volumeAccel, 2),
    volLiqRatio: round(volLiqRatio, 4),
    fdvLiqRatio: round(fdvLiqRatio, 2),
    buyPressure5m: round(buyPressure5m, 2),
    buyPressure1h: round(buyPressure1h, 2),
    momentumAlign,
    crashSignal,
    pumpSignal,
    totalTx5m,
    totalTx1h,
  };
}

// ── 3. CLUSTERING — Group tokens by risk/opportunity profile ─

/**
 * Simple rule-based clustering inspired by K-means centroid logic
 * but using domain-specific thresholds for hackathon speed.
 *
 * Clusters:
 *   A = "Strong Opportunity" — high volume accel, positive momentum, healthy liq
 *   B = "Stable Growth" — moderate metrics, consistent buy pressure
 *   C = "High Risk / Volatile" — extreme metrics, potential pump & dump
 *   D = "Bearish / Crash Risk" — negative momentum, sell pressure
 */
function classifyCluster(f) {
  // Cluster D: Bearish / Crash
  if (f.crashSignal || (f.priceChange5m < -8) ||
      (f.momentumAlign === -1 && f.buyPressure5m < 0.35)) {
    return { cluster: 'D', label: '🔴 Bearish / Crash Risk' };
  }

  // Cluster C: High Risk Volatile (extreme pump, low liq)
  if ((f.priceChange5m > 15 && f.volLiqRatio > 1) ||
      (f.fdvLiqRatio > 200 && f.priceChange5m > 5) ||
      (f.pumpSignal && f.liquidity < 10000)) {
    return { cluster: 'C', label: '🟡 High Risk / Volatile' };
  }

  // Cluster A: Strong Opportunity
  if (f.volumeAccel > 1.8 && f.buyPressure5m > 0.55 &&
      f.momentumAlign === 1 && f.liquidity > 5000 &&
      f.priceChange5m > 0 && f.priceChange5m < 15) {
    return { cluster: 'A', label: '🟢 Strong Opportunity' };
  }

  // Cluster B: Stable Growth
  if (f.buyPressure1h > 0.5 && f.priceChange1h > 0 && f.liquidity > 3000) {
    return { cluster: 'B', label: '🔵 Stable Growth' };
  }

  // Default: Neutral
  return { cluster: 'N', label: '⚪ Neutral' };
}

// ── 4. DECISION MAKING — Generate BUY / SELL / HOLD Signals ──

/**
 * Decision logic:
 *
 * BUY signal when:
 *   - Cluster A or B
 *   - Volume acceleration anomaly (>2x) with stable 5m price (not crash)
 *   - Buy pressure > 55% in 5m window
 *   - Liquidity healthy (>$5k)
 *
 * SELL signal when:
 *   - Cluster D (crash indicator)
 *   - Price drop >5% in 5m (flash crash)
 *   - Or target profit reached (configurable, default +10% from entry)
 *
 * HOLD when:
 *   - Neutral cluster or insufficient data
 */
function generateSignal(f) {
  const { cluster } = classifyCluster(f);

  // ── SELL conditions ──
  if (cluster === 'D') {
    const reasons = [];
    if (f.crashSignal) reasons.push('Reversal detected (5m crash after 1h gain)');
    if (f.priceChange5m < -8) reasons.push(`Sharp drop ${f.priceChange5m}% in 5m`);
    if (f.buyPressure5m < 0.35) reasons.push(`Heavy sell pressure (buy ratio ${f.buyPressure5m})`);
    return {
      signal: 'SELL',
      emoji: '🔴',
      confidence: clamp(70 + Math.abs(f.priceChange5m) * 2, 60, 95),
      reasons,
    };
  }

  // ── BUY conditions ──
  if (cluster === 'A') {
    const reasons = [];
    if (f.volumeAccel > 2) reasons.push(`Volume anomaly: ${f.volumeAccel}x above average`);
    if (f.buyPressure5m > 0.6) reasons.push(`Strong buy pressure: ${Math.round(f.buyPressure5m * 100)}%`);
    if (f.momentumAlign === 1) reasons.push('Aligned positive momentum (5m + 1h)');
    reasons.push(`Liquidity: $${formatNum(f.liquidity)}`);
    return {
      signal: 'BUY',
      emoji: '🟢',
      confidence: clamp(65 + f.volumeAccel * 5 + f.buyPressure5m * 20, 60, 95),
      reasons,
    };
  }

  if (cluster === 'B') {
    return {
      signal: 'BUY',
      emoji: '🔵',
      confidence: clamp(55 + f.buyPressure1h * 15, 50, 75),
      reasons: [
        `Stable growth pattern`,
        `Buy pressure 1h: ${Math.round(f.buyPressure1h * 100)}%`,
        `Price +${f.priceChange1h}% (1h)`,
      ],
    };
  }

  // ── HOLD / CAUTION ──
  if (cluster === 'C') {
    return {
      signal: 'CAUTION',
      emoji: '⚠️',
      confidence: 50,
      reasons: [
        'High volatility detected',
        f.pumpSignal ? 'Potential pump pattern' : 'Extreme price movement',
        `FDV/Liq ratio: ${f.fdvLiqRatio}x`,
      ],
    };
  }

  return {
    signal: 'HOLD',
    emoji: '⏸️',
    confidence: 40,
    reasons: ['Insufficient signal strength', 'Wait for clearer pattern'],
  };
}

// ── 5. MAIN ANALYSIS PIPELINE ────────────────────────────────

/**
 * Full pipeline: Fetch → Normalize → Feature Engineer → Cluster → Signal
 * @param {string} query — token name/symbol or address
 * @returns {Object} analysis result with signals
 */
async function analyzeToken(query) {
  // Determine if query is a Solana address (base58, 32-44 chars)
  const isAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query);
  const rawData = isAddress
    ? await fetchByAddress(query)
    : await fetchTokenData(query);

  if (!rawData || rawData.length === 0) {
    return { success: false, error: `Token "${query}" tidak ditemukan di Dexscreener Solana.` };
  }

  // Pick the pair with highest liquidity as primary
  const sorted = rawData.sort((a, b) => b.liquidity - a.liquidity);
  const primary = sorted[0];

  // Feature engineering
  const features = computeFeatures(primary);
  const clusterInfo = classifyCluster(features);
  const signal = generateSignal(features);

  return {
    success: true,
    token: features.baseToken,
    tokenName: features.baseTokenName,
    tokenAddress: features.baseTokenAddress,
    pair: `${features.baseToken}/${features.quoteToken}`,
    dex: features.dex,
    priceUsd: features.priceUsd,
    pairUrl: features.pairUrl,

    // Patterned Dataset
    dataset: {
      volume: { m5: features.volume5m, h1: features.volume1h, h6: features.volume6h, h24: features.volume24h },
      priceChange: { m5: features.priceChange5m, h1: features.priceChange1h, h6: features.priceChange6h, h24: features.priceChange24h },
      liquidity: features.liquidity,
      fdv: features.fdv,
      marketCap: features.marketCap,
    },

    // Derived features
    features: {
      volumeAccel: features.volumeAccel,
      volLiqRatio: features.volLiqRatio,
      fdvLiqRatio: features.fdvLiqRatio,
      buyPressure5m: features.buyPressure5m,
      buyPressure1h: features.buyPressure1h,
      momentumAlign: features.momentumAlign,
      crashSignal: features.crashSignal,
      pumpSignal: features.pumpSignal,
    },

    // Clustering
    cluster: clusterInfo,

    // Decision
    signal,

    // Additional pairs for context
    altPairs: sorted.slice(1, 4).map(p => ({
      pair: `${p.baseToken}/${p.quoteToken}`,
      dex: p.dex,
      liquidity: p.liquidity,
      priceUsd: p.priceUsd,
    })),
  };
}

/**
 * Scan top trending tokens and return analysis for each.
 */
async function scanTrending() {
  try {
    const res = await axios.get(`${DEX_BASE}/token-boosts/latest/v1`, { timeout: 8000 });
    const tokens = (res.data || [])
      .filter(t => t.chainId === 'solana')
      .slice(0, 6);

    if (tokens.length === 0) {
      // Fallback: scan popular Solana tokens
      const fallbackTokens = ['SOL', 'BONK', 'JUP', 'WIF', 'PYTH'];
      const results = [];
      for (const t of fallbackTokens) {
        const r = await analyzeToken(t);
        if (r.success) results.push(r);
      }
      return results;
    }

    const results = [];
    for (const t of tokens) {
      const r = await analyzeToken(t.tokenAddress);
      if (r.success) results.push(r);
    }
    return results;
  } catch (err) {
    logger.error(`Trending scan error: ${err.message}`);
    // Fallback
    const results = [];
    for (const t of ['SOL', 'BONK', 'JUP']) {
      const r = await analyzeToken(t);
      if (r.success) results.push(r);
    }
    return results;
  }
}

// ── 6. TELEGRAM MESSAGE FORMATTERS ───────────────────────────

function formatAnalysisMessage(a) {
  if (!a.success) return `❌ ${a.error}`;

  const s = a.signal;
  const d = a.dataset;
  const f = a.features;

  let msg = ``;
  msg += `${s.emoji} *SIGNAL: ${s.signal}* (Confidence: ${Math.round(s.confidence)}%)\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🪙 *${a.pair}* on ${a.dex}\n`;
  msg += `💲 Price: $${a.priceUsd < 0.01 ? a.priceUsd.toExponential(2) : a.priceUsd.toFixed(4)}\n`;
  if (a.tokenAddress) msg += `📋 Address: \`${a.tokenAddress}\`\n`;
  msg += `\n`;

  msg += `📊 *Patterned Dataset:*\n`;
  msg += `┌─ Volume\n`;
  msg += `│  5m: $${formatNum(d.volume.m5)} │ 1h: $${formatNum(d.volume.h1)}\n`;
  msg += `│  6h: $${formatNum(d.volume.h6)} │ 24h: $${formatNum(d.volume.h24)}\n`;
  msg += `├─ Price Change\n`;
  msg += `│  5m: ${fmtPct(d.priceChange.m5)} │ 1h: ${fmtPct(d.priceChange.h1)}\n`;
  msg += `│  6h: ${fmtPct(d.priceChange.h6)} │ 24h: ${fmtPct(d.priceChange.h24)}\n`;
  msg += `├─ Liquidity: $${formatNum(d.liquidity)}\n`;
  msg += `├─ FDV: $${formatNum(d.fdv)}\n`;
  msg += `└─ MCap: $${formatNum(d.marketCap)}\n\n`;

  msg += `🔬 *Feature Analysis:*\n`;
  msg += `• Volume Accel: ${f.volumeAccel}x\n`;
  msg += `• Vol/Liq Ratio: ${f.volLiqRatio}\n`;
  msg += `• Buy Pressure 5m: ${Math.round(f.buyPressure5m * 100)}%\n`;
  msg += `• Momentum: ${f.momentumAlign === 1 ? '↑ Aligned' : f.momentumAlign === -1 ? '↓ Bearish' : '→ Mixed'}\n`;
  if (f.crashSignal) msg += `• ⚠️ CRASH SIGNAL DETECTED\n`;
  if (f.pumpSignal) msg += `• 🚀 PUMP PATTERN DETECTED\n`;
  msg += `\n`;

  msg += `📦 *Cluster:* ${a.cluster.label}\n\n`;

  msg += `📌 *Reasons:*\n`;
  s.reasons.forEach(r => { msg += `  • ${r}\n`; });

  msg += `\n🔗 [View on Dexscreener](${a.pairUrl})`;
  msg += `\n\n_Sentia Dex Analyzer • Data real-time via Dexscreener API_`;

  return msg;
}

function formatScanMessage(results) {
  if (!results || results.length === 0) {
    return '❌ Tidak ada data trending yang tersedia saat ini.';
  }

  let msg = `📡 *SENTIA MARKET SCAN*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  results.forEach((a, i) => {
    const s = a.signal;
    const pc5 = fmtPct(a.dataset.priceChange.m5);
    const pc1h = fmtPct(a.dataset.priceChange.h1);
    const shortAddr = a.tokenAddress ? `${a.tokenAddress.slice(0, 6)}...${a.tokenAddress.slice(-4)}` : '—';
    msg += `${i + 1}. ${s.emoji} *${a.pair}* — $${a.priceUsd < 0.01 ? a.priceUsd.toExponential(2) : a.priceUsd.toFixed(4)}\n`;
    msg += `   📋 \`${shortAddr}\`\n`;
    msg += `   Signal: *${s.signal}* (${Math.round(s.confidence)}%) │ ${a.cluster.label}\n`;
    msg += `   5m: ${pc5} │ 1h: ${pc1h} │ Liq: $${formatNum(a.dataset.liquidity)}\n\n`;
  });

  msg += `_Scan selesai • ${results.length} token dianalisis_\n`;
  msg += `_Gunakan_ /analyze <token> _untuk detail lengkap_`;

  return msg;
}

function formatTrendingMessage(results) {
  if (!results || results.length === 0) {
    return '❌ Tidak ada data trending yang tersedia saat ini.';
  }

  let msg = `🔥 *TRENDING TOKENS — SOLANA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  results.forEach((a, i) => {
    const s = a.signal;
    const pc1h = fmtPct(a.dataset.priceChange.h1);
    const pc24h = fmtPct(a.dataset.priceChange.h24);
    msg += `${i + 1}. ${s.emoji} *${a.tokenName || a.token}* (${a.token})\n`;
    msg += `   💲 $${a.priceUsd < 0.01 ? a.priceUsd.toExponential(2) : a.priceUsd.toFixed(4)}  │  1h: ${pc1h}  │  24h: ${pc24h}\n`;
    msg += `   📋 \`${a.tokenAddress || '—'}\`\n`;
    msg += `   🏷️ Signal: *${s.signal}* │ ${a.cluster.label}\n`;
    msg += `   💧 Liq: $${formatNum(a.dataset.liquidity)} │ MCap: $${formatNum(a.dataset.marketCap)}\n\n`;
  });

  msg += `_/analyze <nama token> untuk analisis mendalam_`;

  return msg;
}

// ── Helpers ──────────────────────────────────────────────────

function round(n, d) { return Math.round(n * 10 ** d) / 10 ** d; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}

function fmtPct(v) {
  if (v == null) return '0%';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

module.exports = {
  analyzeToken,
  scanTrending,
  formatAnalysisMessage,
  formatScanMessage,
  formatTrendingMessage,
  fetchTokenData,
  fetchByAddress,
};
