const express = require("express");
const { processArbitrageOpportunities, processCustomArbitrageQuery } = require("../services/arbitrageService");

const router = express.Router();

/**
 * GET /arbitrage - Fetches ranked arbitrage opportunities
 */
router.get("/arbitrage", async (req, res) => {
  const data = await processArbitrageOpportunities();
  res.json({ opportunities: data });
});

/**
 * POST /arbitrage/custom - Runs a custom Bitquery arbitrage query
 */
router.post("/arbitrage/custom", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const data = await processCustomArbitrageQuery(query);
  res.json({ opportunities: data });
});

module.exports = router;
