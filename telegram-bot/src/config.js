// ============================================================
// Sentia Agent Wallet Bot - Configuration
// ============================================================

require('dotenv').config();

module.exports = {
  // Bot token from BotFather
  BOT_TOKEN: process.env.BOT_TOKEN,

  // Admin user ID (set in .env to get admin commands)
  ADMIN_ID: process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : null,

  // OpenRouter API Key for AI Trading Assistant
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,

  // Bot identity
  BOT_NAME: 'Sentia',
  BOT_VERSION: '1.0.0',
  BOT_TAGLINE: 'Autonomous Agent Wallet Infrastructure for Solana',

  // Sentia product info
  WEBSITE_URL: 'https://sentia.dev',
  DOCS_URL: 'https://docs.sentia.dev',
  GITHUB_URL: 'https://github.com/sentia-wallet',
  HACKATHON: 'Solana · Colosseum Hackathon 2026',

  // Rate limiting
  RATE_LIMIT: 30,
  RATE_LIMIT_WINDOW: 60000,

  // Session timeout (30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000,

  // Data directory for persistent storage
  DATA_DIR: require('path').join(__dirname, '..', 'data'),

  // Demo agent wallet data (simulated)
  DEMO_AGENTS: [
    { name: 'Trading Bot Alpha', spent: 234.50, limit: 500, txCount: 47, status: 'active', token: 'USDC' },
    { name: 'Data Scraper', spent: 89.20, limit: 200, txCount: 23, status: 'active', token: 'USDC' },
    { name: 'DeFi Agent', spent: 412.80, limit: 500, txCount: 31, status: 'pending', token: 'USDC' },
    { name: 'Content Creator', spent: 15.60, limit: 100, txCount: 8, status: 'active', token: 'USDC' },
  ],

  // Demo recent transactions
  DEMO_TRANSACTIONS: [
    { id: 'tx_8f2a', agent: 'Trading Bot Alpha', type: 'Transfer', amount: 5.0, token: 'USDC', status: 'approved', time: '2 min ago', to: '4kRf...9xPq' },
    { id: 'tx_3b7c', agent: 'Data Scraper', type: 'Service Payment', amount: 2.5, token: 'USDC', status: 'approved', time: '8 min ago', to: '7mNp...2wKz' },
    { id: 'tx_9d1e', agent: 'DeFi Agent', type: 'Swap', amount: 45.0, token: 'USDC', status: 'pending', time: '12 min ago', to: '2xLq...5vRm' },
    { id: 'tx_5f4a', agent: 'Content Creator', type: 'API Payment', amount: 1.2, token: 'USDC', status: 'approved', time: '25 min ago', to: '9bCd...3jHn' },
    { id: 'tx_1c8b', agent: 'Trading Bot Alpha', type: 'Large Purchase', amount: 150.0, token: 'USDC', status: 'rejected', time: '1 hr ago', to: '6pWx...8tYz' },
  ],

  // Pricing plans
  PRICING: {
    free: { name: 'Free', price: 0, agents: 1, txLimit: '100 tx/mo', features: ['Basic Dashboard', 'Standard Webhooks', 'Community Support'] },
    pro: { name: 'Pro', price: 29, agents: 'Unlimited', txLimit: 'Unlimited', features: ['Advanced Dashboard', 'Priority Webhooks', 'Email + Telegram', 'Analytics & Trends', 'CSV/API Export', 'Priority Support'] },
    enterprise: { name: 'Enterprise', price: 'Custom', agents: '100+', txLimit: 'Unlimited', features: ['Dedicated Infra', 'Custom Policies', 'SSO & Teams', 'SLA 99.9%', 'Account Manager'] },
  },
};
