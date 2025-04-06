const express = require('express');
const router = express.Router();

const { getTopTrades, findArbitrageOpportunities, fetchHistoricalData } = require('../services/analyticService'); 


// ✅ Top Trades Route
router.get('/top-trades', async (req, res) => {
    try {
        const topTrades = await getTopTrades();
        res.json(topTrades);
    } catch (error) {
        console.error('Error fetching top trades:', error.message);
        res.status(500).json({ message: 'Error fetching top trades.' });
    }
});

// ✅ Arbitrage Opportunities Route
router.get('/arbitrage', async (req, res) => {
    try {
        const opportunities = await findArbitrageOpportunities();
        res.json(opportunities);
    } catch (error) {
        console.error('Error finding arbitrage opportunities:', error.message);
        res.status(500).json({ message: 'Error finding arbitrage opportunities.' });
    }
});

// ✅ Historical Data Route
router.get('/historical', async (req, res) => {
    const { token, timeframe } = req.query;
    try {
        const historicalData = await fetchHistoricalData(token, timeframe);
        res.json(historicalData);
    } catch (error) {
        console.error('Error fetching historical data:', error.message);
        res.status(500).json({ message: 'Error fetching historical data.' });
    }
});


module.exports = router;
