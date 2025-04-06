const Trade = require('../models/Trade');

/**
 * Logs a trade into the database.
 * @param {Object} tradeData - The trade data to log.
 * @returns {Promise<Object|null>} - Returns saved trade object or null on failure.
 */
const logTrade = async (tradeData) => {
    try {
        // Ensure tradeData is valid before saving
        if (!tradeData || !tradeData.pair || !tradeData.amount || !tradeData.price) {
            console.error('❌ Invalid trade data:', tradeData);
            return null;
        }

        const trade = new Trade(tradeData);
        await trade.save();
        console.log('✅ Trade successfully logged:', trade);
        return trade;
    } catch (error) {
        console.error('❌ Error saving trade:', error.message);
        return null;
    }
};

module.exports = { logTrade };
