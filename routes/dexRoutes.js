const express = require("express");
const { fetchSerumData, fetchRaydiumPools, fetchMeteoraLiquidity, fetchJupiterQuotes } = require("../services/dexService");

const router = express.Router();

router.get("/serum", async (req, res) => {
    const data = await fetchSerumData();
    res.json(data);
});

router.get("/raydium", async (req, res) => {
    const data = await fetchRaydiumPools();
    res.json(data);
});

router.get("/meteora", async (req, res) => {
    const data = await fetchMeteoraLiquidity();
    res.json(data);
});

router.get("/jupiter", async (req, res) => {
    const { inputMint, outputMint, amount } = req.query;
    const data = await fetchJupiterQuotes(inputMint, outputMint, amount);
    res.json(data);
});

module.exports = router;
