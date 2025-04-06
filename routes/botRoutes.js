const express = require('express');
const router = express.Router();
const { startTradingBot, stopTradingBot, checkBotStatus } = require('../services/botService');

// Start the bot
router.get('/start', (req, res) => {
    startTradingBot();
    res.json({ message: 'Trading bot started!' });
});

// Stop the bot
router.get('/stop', (req, res) => {
    stopTradingBot();
    res.json({ message: 'Trading bot stopped!' });
});

// Check bot status
router.get('/status', (req, res) => {
    const status = checkBotStatus();
    res.json({ status });
});

module.exports = router;
