const express = require('express');
const { fetchOHLCData } = require('../services/bitqueryService');
const router = express.Router();

router.get('/ohlc', async (req, res) => {
    const data = await fetchOHLCData();
    res.json(data);
});

module.exports = router;
