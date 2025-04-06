const express = require('express');
const { executeTrade, getTrades } = require('../controllers/tradeController'); // ✅ Import getTrades
const router = express.Router();

router.post('/trade', executeTrade);
router.get('/trades', getTrades);  // ✅ Ensure getTrades is properly defined

router.get('/test', (req, res) => {
    console.log('⚡ [Trade Route] /api/trades/test hit');
    res.json({ message: 'Trade route is working!' });
});


console.log("✅ tradeRoutes.js loaded");


module.exports = router;
