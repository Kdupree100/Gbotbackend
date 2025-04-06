const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    token: String,
    buyExchange: String,
    sellExchange: String,
    buyPrice: Number,
    sellPrice: Number,
    profit: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);
