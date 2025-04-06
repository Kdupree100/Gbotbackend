require('dotenv').config();
const { fetchTopTrades } = require('./services/bitqueryService'); // ✅ Corrected path

const testQuery = async () => {
    try {
        const trades = await fetchTopTrades();
        console.log('✅ Successfully fetched trades:', trades);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testQuery();
