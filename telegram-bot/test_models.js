const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('hello, tell me one word.');
    console.log(`[SUCCESS] ${modelName}:`, result.response.text());
    return true;
  } catch (e) {
    if (e.message.includes('429')) {
      console.log(`[RATE_LIMIT] ${modelName}`);
    } else {
      console.log(`[ERROR] ${modelName}: ${e.message.substring(0, 50)}...`);
    }
    return false;
  }
}

async function run() {
  const modelsToTest = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-pro-latest',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash'
  ];
  
  for (const m of modelsToTest) {
    console.log(`Testing ${m}...`);
    const success = await testModel(m);
    if (success) {
      console.log('Found working model:', m);
      break;
    }
  }
}

run();
