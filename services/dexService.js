const axios = require("axios");

/**
 * Fetches market data from Serum DEX
 * @returns {Promise<Object|null>} Serum market data
 */
const fetchSerumData = async () => {
    try {
        const response = await axios.get("https://serum-api.com/markets");
        console.log("✅ Successfully fetched Serum market data");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Serum data:", error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches Raydium liquidity pool data
 * @returns {Promise<Object|null>} Raydium pool data
 */
const fetchRaydiumPools = async () => {
    try {
        const response = await axios.get("https://api.raydium.io/pairs");
        console.log("✅ Successfully fetched Raydium pools");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Raydium pools:", error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches liquidity data from Meteora DEX
 * @returns {Promise<Object|null>} Meteora liquidity data
 */
const fetchMeteoraLiquidity = async () => {
    try {
        const response = await axios.get("https://meteora-api.com/liquidity");
        console.log("✅ Successfully fetched Meteora liquidity data");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Meteora liquidity:", error.response?.data || error.message);
        return null;
    }
};

/**
 * Fetches swap quotes from Jupiter Aggregator
 * @param {string} inputMint - The mint address of the input token
 * @param {string} outputMint - The mint address of the output token
 * @param {number} amount - The amount to swap
 * @returns {Promise<Object|null>} Jupiter swap quote
 */
const fetchJupiterQuotes = async (inputMint, outputMint, amount) => {
    try {
        const response = await axios.get(`https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`);
        console.log(`✅ Successfully fetched Jupiter quote for ${inputMint} → ${outputMint}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching Jupiter quotes:", error.response?.data || error.message);
        return null;
    }
};

module.exports = {
    fetchSerumData,
    fetchRaydiumPools,
    fetchMeteoraLiquidity,
    fetchJupiterQuotes
};
