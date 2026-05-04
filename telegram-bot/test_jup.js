const axios = require('axios');

async function checkPrice() {
  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=solana,jupiter-exchange-solana,bonk,usd-coin&vs_currencies=usd`);
    console.log(res.data);
  } catch (e) {
    console.error('Coingecko failed:', e.response ? e.response.statusText : e.message);
  }
}

checkPrice();
