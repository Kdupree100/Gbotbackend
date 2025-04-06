const ARBITRAGE_QUERY = `
{
  solana(network: solana) {
    dexTrades(
      options: {desc: ["block.timestamp.time"]}
      exchangeName: {in: ["Raydium", "Pumpfun", "Meteora"]}
    ) {
      baseCurrency {
        symbol
      }
      buyAmount
      buyPrice
      sellAmount
      sellPrice
      transaction {
        hash
      }
    }
  }
}
`;

module.exports = ARBITRAGE_QUERY;
const axios = require('axios');

const SOLANA_DEXS = {
    meteora: 'https://api.meteora.ag/swap/quote',
    pumpfun: 'https://api.pump.fun/ticker',
    raydium: 'https://api.raydium.io/v2/sdk/price'
};

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price?symbol=';

async function getSolanaDexPrice(tokenSymbol) {
    try {
        // Fetch prices from all Solana DEXs
        const responses = await Promise.all([
            axios.get(`${SOLANA_DEXS.meteora}?inputMint=${tokenSymbol}`),
            axios.get(`${SOLANA_DEXS.pumpfun}/${tokenSymbol}`),
            axios.get(`${SOLANA_DEXS.raydium}`)
        ]);

        return {
            meteora: responses[0]?.data?.price || null,
            pumpfun: responses[1]?.data?.price || null,
            raydium: responses[2]?.data?.data?.[tokenSymbol] || null,
        };
    } catch (error) {
        console.error('Error fetching Solana DEX prices:', error.message);
        return null;
    }
}

async function getBinancePrice(tokenSymbol) {
    try {
        const response = await axios.get(`${BINANCE_API}${tokenSymbol.toUpperCase()}USDT`);
        return response.data.price;
    } catch (error) {
        console.error('Error fetching Binance price:', error.message);
        return null;
    }
}

async function checkArbitrageOpportunity(tokenSymbol) {
    const dexPrices = await getSolanaDexPrice(tokenSymbol);
    const binancePrice = await getBinancePrice(tokenSymbol);

    if (!dexPrices || !binancePrice) {
        console.log('Missing data, cannot calculate arbitrage.');
        return;
    }

    console.log(`Prices for ${tokenSymbol}:`);
    console.log(`Binance: ${binancePrice} USDT`);
    console.log(`Meteora: ${dexPrices.meteora ? dexPrices.meteora + ' USDT' : 'N/A'}`);
    console.log(`Pump.fun: ${dexPrices.pumpfun ? dexPrices.pumpfun + ' USDT' : 'N/A'}`);
    console.log(`Raydium: ${dexPrices.raydium ? dexPrices.raydium + ' USDT' : 'N/A'}`);

    // Identify best DEX price
    const bestDexPrice = Math.min(...Object.values(dexPrices).filter(Boolean));
    if (bestDexPrice && binancePrice > bestDexPrice) {
        console.log(`🚀 Arbitrage Opportunity! Buy at ${bestDexPrice} USDT and sell at ${binancePrice} USDT.`);
    } else {
        console.log('No arbitrage opportunity found.');
    }
}

// Run for a specific token (e.g., SOL)
checkArbitrageOpportunity('SOL');
