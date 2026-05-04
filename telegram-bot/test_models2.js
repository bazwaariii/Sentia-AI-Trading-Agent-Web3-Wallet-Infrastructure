const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    await model.generateContent('hi');
    console.log('[OK]', modelName);
    return true;
  } catch (e) {
    if (e.message.includes('429')) console.log('[429]', modelName);
    else if (e.message.includes('Limit: 0')) console.log('[Lim0]', modelName);
    else console.log('[ERR]', modelName, e.message.substring(0,40));
    return false;
  }
}

async function run() {
  const models = [
    'gemini-2.5-pro',
    'gemini-pro-latest',
    'gemini-3.1-pro-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest'
  ];
  for (const m of models) {
    await test(m);
  }
}

run();
