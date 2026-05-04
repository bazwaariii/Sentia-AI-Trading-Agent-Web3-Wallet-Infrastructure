# Sentia - AI Trading Agent & Web3 Wallet Infrastructure

Sentia is a comprehensive Web3 platform featuring an AI-powered trading agent and wallet infrastructure built on the Solana blockchain. The project aims to simplify crypto trading and wallet management by leveraging Artificial Intelligence, enabling users to interact seamlessly with their crypto assets using natural language through both a web dashboard and a Telegram bot.

## 🚀 Project Structure

This repository is divided into two main components:

### 1. Web Dashboard (`/sentia`)
A modern, responsive web application for managing your AI trading agent, viewing wallet analytics, and monitoring blockchain transactions.

**Tech Stack:**
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS, Radix UI, Framer Motion
- **Database:** Prisma ORM
- **Web3:** `@solana/web3.js`
- **AI Integration:** Google Generative AI (Gemini) / OpenRouter
- **Visuals:** Three.js, Recharts

### 2. Telegram Bot (`/telegram-bot`)
An interactive Telegram bot that acts as your personal AI trading assistant, allowing you to check balances, analyze market trends, and execute Solana transactions directly from your chat.

**Tech Stack:**
- **Runtime:** Node.js
- **Bot Framework:** `node-telegram-bot-api`
- **Web3:** `@solana/web3.js`, `bs58`, `tweetnacl`
- **AI Integration:** Google Generative AI

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- npm or yarn or pnpm
- A Telegram account (for the bot)

You will also need the following API Keys:
- **Telegram Bot Token** (from [@BotFather](https://t.me/botfather))
- **Google Gemini API Key** or **OpenRouter API Key**
- Database URL (MySQL/PostgreSQL) for Prisma

---

## 💻 Installation & Setup

### Setting up the Web Dashboard

1. Navigate to the `sentia` directory:
   ```bash
   cd sentia
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `sentia` directory and add your environment variables (Database URL, AI Keys, Solana RPC).
4. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### Setting up the Telegram Bot

1. Navigate to the `telegram-bot` directory:
   ```bash
   cd telegram-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `telegram-bot` directory and add the necessary environment variables:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   GEMINI_API_KEY=your_gemini_api_key
   # Add other required variables (RPC URL, etc.)
   ```
4. Start the bot:
   ```bash
   npm start
   ```
   *For development with auto-reload, you can use `npm run dev`.*

---

## 🌟 Features

- **AI-Powered Insights:** Get real-time market analysis and trading recommendations powered by advanced LLMs.
- **Natural Language Trading:** Execute Solana transactions and manage your wallet simply by chatting with the Telegram bot.
- **Modern Dashboard:** Monitor your portfolio with interactive charts and 3D data visualizations.
- **Secure Infrastructure:** Non-custodial or securely managed wallet integrations using standard Web3 cryptographic practices.

---

## 📄 License

This project is created for hackathon purposes.
