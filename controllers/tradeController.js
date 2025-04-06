const { logTrade } = require('../services/tradeService');
const Trade = require('../models/Trade'); // Ensure this path is correct


const executeTrade = async (req, res) => {
    try {
        const tradeData = req.body;  // Expecting JSON trade data

        if (!tradeData.token || !tradeData.buyExchange || !tradeData.sellExchange || !tradeData.buyPrice || !tradeData.sellPrice) {
            return res.status(400).json({ error: "Missing required trade data" });
        }

        // Log the trade in the database
        const trade = await logTrade(tradeData);

        res.json({ message: "Trade executed and logged", trade });
    } catch (error) {
        console.error("Error executing trade:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getTrades = async (req, res) => {
    try {
        const trades = await Trade.find().sort({ createdAt: -1 }); // Get all trades, sorted by latest
        res.json(trades);
    } catch (error) {
        console.error("Error fetching trades:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { executeTrade, getTrades };
