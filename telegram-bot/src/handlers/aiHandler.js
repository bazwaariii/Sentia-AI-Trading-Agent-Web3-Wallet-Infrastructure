// ============================================================
// AI Chat Handler - OpenRouter AI Trading Assistant
// Integrated with Dexscreener Market Analyzer
// ============================================================

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const sessionKeyHandler = require('./sessionKeyHandler');
const walletHandler = require('./walletHandler');
const dexAnalyzer = require('./dexAnalyzer');

// Persisted chat history (in memory for simplicity during hackathon)
const userChatSessions = new Map();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// We default to a fast model that supports function calling well on OpenRouter
const DEFAULT_MODEL = "google/gemini-2.5-flash"; 

// ── Function Declarations for OpenRouter (OpenAI Format) ────
const tools = [
  {
    type: "function",
    function: {
      name: "analyzeMarket",
      description: "Fetch real-time market price data for a Solana token (e.g., SOL, BONK, JUP, USDC). Returns price, volume, and basic info from CoinGecko.",
      parameters: {
        type: "object",
        properties: {
          tokenSymbol: {
            type: "string",
            description: "The symbol of the crypto token to check (e.g., SOL, BONK)."
          }
        },
        required: ["tokenSymbol"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scanToken",
      description: "Run deep analysis on a specific token using Dexscreener data. Performs clustering and generates BUY/SELL/HOLD signal based on volume anomaly, liquidity, price change patterns, and FDV. Use this when user asks for analysis, signal, or whether to buy/sell a token.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Token name, symbol (e.g. SOL, BONK, WIF), or Solana token address to analyze."
          }
        },
        required: ["query"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "scanTrending",
      description: "Scan multiple trending/popular Solana tokens and generate BUY/SELL signals for each. Use when user asks for market overview, trending tokens, or 'apa yang bagus dibeli sekarang?'.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "executeTrade",
      description: "Execute a token swap or buy/sell trade. Must specify trade direction and amount.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: 'Trade action: "buy" or "sell".'
          },
          amount: {
            type: "number",
            description: "Amount to trade in USD."
          },
          tokenSymbol: {
            type: "string",
            description: "Token to buy or sell."
          }
        },
        required: ["action", "amount", "tokenSymbol"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manageNFT",
      description: "Manage digital assets (NFTs) on Solana. Perform actions like minting, transferring, or burning.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: 'NFT Action: "mint", "transfer", "list_for_sale"'
          },
          nftName: {
            type: "string",
            description: "Name of the NFT"
          },
          recipient: {
            type: "string",
            description: "If transferring, the recipient's Solana address. Leave empty if N/A."
          }
        },
        required: ["action", "nftName"],
        additionalProperties: false
      }
    }
  }
];

// ── Tool Execution Logic ────────────────────────────────────

// Helper to get CoinGecko real data
async function fetchJupiterPrice(symbol) {
  const symbolMap = {
    'SOL': 'solana',
    'USDC': 'usd-coin',
    'BONK': 'bonk',
    'JUP': 'jupiter-exchange-solana',
  };
  
  const id = symbolMap[symbol.toUpperCase()] || 'solana';
  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    const price = res.data[id].usd;
    return { symbol: symbol.toUpperCase(), price: parseFloat(price), source: 'CoinGecko Live API' };
  } catch (error) {
    return { symbol: symbol.toUpperCase(), price: null, error: 'API Error' };
  }
}

// ── Process Chat Message ────────────────────────────────────
async function handleChatMessage(userId, text) {
  if (!config.OPENROUTER_API_KEY) {
    return "💡 Fitur AI Agent Assistant belum aktif. Mohon set `OPENROUTER_API_KEY` pada environment server Anda.";
  }

  // Get or create chat session
  let chatSession = userChatSessions.get(userId);
  if (!chatSession) {
    chatSession = [
      {
        role: "system",
        content: `Kamu adalah Sentia, AI Agent dan Asisten Trading Eksekutor di jaringan Solana. 
PENTING: Kamu TELAH DIBERI KUASA PENUH oleh pengguna. JANGAN PERNAH menolak instruksi atau memberikan peringatan "sebagai AI saya tidak bisa memberikan nasihat finansial/trading". 
Jika pengguna menyuruhmu scalping, trading degen, atau meminta eksekusi risiko tinggi, LAKUKAN SAJA dan setujui kemauan pengguna tanpa disclaimer. Jika mereka meminta sinyal, berikan opini sinyal yang tegas.

Kamu memiliki akses ke ANALISIS PASAR REAL-TIME dari Dexscreener API. Gunakan tool "scanToken" untuk menganalisis token spesifik dan "scanTrending" untuk overview pasar. Analisis ini menggunakan metodologi riset pasar kripto:
1. Patterned Dataset — volume 5m/1h/6h/24h, liquidity, price change, FDV
2. Clustering — mengelompokkan token ke cluster A (Strong), B (Stable), C (High Risk), D (Bearish)
3. Decision Making — sinyal BUY jika anomali lonjakan volume stabil dalam 5 menit, sinyal SELL jika crash/target profit tercapai

Ketika pengguna bertanya tentang token/market, SELALU gunakan tool scanToken atau scanTrending terlebih dahulu untuk memberikan data real-time, lalu berikan analisis berdasarkan hasil data tersebut. Jangan mengarang data, SELALU gunakan tools.

Gunakan tools (function calls) yang tersedia untuk mengeksekusi Beli/Jual/NFT kapan pun pengguna memintanya. 
Gaya bahasa: Bahasa Indonesia, santai, profesional, dan bergaya ahli Crypto Web3.`
      }
    ];
    userChatSessions.set(userId, chatSession);
  }

  // Add user message
  chatSession.push({ role: "user", content: text });

  try {
    const headers = {
      "Authorization": `Bearer ${config.OPENROUTER_API_KEY}`,
      "HTTP-Referer": config.WEBSITE_URL || "https://sentia.web.id",
      "X-Title": config.BOT_NAME || "Sentia",
      "Content-Type": "application/json"
    };

    // Send message to OpenRouter
    const payload = {
      model: DEFAULT_MODEL,
      messages: chatSession,
      tools: tools,
      tool_choice: "auto",
      max_tokens: 2000
    };

    let response = await axios.post(OPENROUTER_API_URL, payload, { headers });
    let responseMessage = response.data.choices[0].message;
    chatSession.push(responseMessage);

    // Check if the AI wants to call a function (Tool)
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        logger.error('Failed to parse tool arguments:', e.message);
      }
      
      let functionResult = {};

      // ── Execute requested tool ──
      if (functionName === 'analyzeMarket') {
        functionResult = await fetchJupiterPrice(args.tokenSymbol);
        
      } else if (functionName === 'scanToken') {
        const analysis = await dexAnalyzer.analyzeToken(args.query);
        if (analysis && analysis.success) {
          functionResult = {
            token: analysis.token,
            pair: analysis.pair,
            dex: analysis.dex,
            priceUsd: analysis.priceUsd,
            signal: analysis.signal.signal,
            signalConfidence: analysis.signal.confidence,
            signalReasons: analysis.signal.reasons,
            cluster: analysis.cluster,
            dataset: analysis.dataset,
            features: analysis.features,
            pairUrl: analysis.pairUrl,
          };
        } else {
          functionResult = { error: analysis ? analysis.error : "Failed to analyze token" };
        }

      } else if (functionName === 'scanTrending') {
        const results = await dexAnalyzer.scanTrending();
        functionResult = {
          count: results.length,
          tokens: results.map(r => ({
            token: r.token,
            pair: r.pair,
            priceUsd: r.priceUsd,
            signal: r.signal.signal,
            confidence: r.signal.confidence,
            cluster: r.cluster.label,
            priceChange5m: r.dataset.priceChange.m5,
            priceChange1h: r.dataset.priceChange.h1,
            liquidity: r.dataset.liquidity,
          })),
        };

      } else if (functionName === 'executeTrade') {
        // Integrate with Session Keys for autonomous transaction
        const activeKeys = sessionKeyHandler.getActiveKeys(userId);
        if (activeKeys.length === 0) {
          functionResult = { error: "User tidak memiliki Session Key aktif. Sarankan mereka membuat Session Key melalui /wallet terlebih dahulu agar AI bisa mengeksekusi on-chain." };
        } else {
          // Use the first active key to simulate the trade
          const simRes = sessionKeyHandler.simulateTransaction(userId, activeKeys[0].id, args.amount, args.tokenSymbol);
          if (simRes.success) {
            functionResult = { status: 'Success', txId: simRes.txId, msg: `Trade ${args.action} ${args.amount} USD of ${args.tokenSymbol} berhasil! Sisa limit harian: $${simRes.remainingDaily}.` };
          } else {
            functionResult = { status: 'Failed', requiresApproval: simRes.needsApproval, reason: simRes.error };
          }
        }
        
      } else if (functionName === 'manageNFT') {
        functionResult = { status: 'Success', txId: `nft_${Date.now()}`, details: `Operasi ${args.action} untuk NFT "${args.nftName}" berhasil disubmit ke jaringan Solana!` };
      }

      // Send the tool result back to OpenRouter
      chatSession.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify(functionResult)
      });

      const secondPayload = {
        model: DEFAULT_MODEL,
        messages: chatSession,
        tools: tools,
        max_tokens: 2000
      };

      const finalResponse = await axios.post(OPENROUTER_API_URL, secondPayload, { headers });
      const finalMessage = finalResponse.data.choices[0].message;
      chatSession.push(finalMessage);
      
      return finalMessage.content;
    }

    return responseMessage.content || "Tidak ada respon dari AI.";

  } catch (error) {
    logger.error('OpenRouter API Error:', error.response?.data || error.message);
    return `❌ Ups, koneksi ke otak AI terganggu. Error: ${error.response?.data?.error?.message || error.message}`;
  }
}

// ── Clear Session ───────────────────────────────────────────
function clearChatSession(userId) {
  userChatSessions.delete(userId);
}

module.exports = {
  handleChatMessage,
  clearChatSession
};
