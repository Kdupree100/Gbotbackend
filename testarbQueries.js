require('dotenv').config(); // Load environment variables

const {
  fetchSerumArbitrageOpportunities,
  fetchRaydiumArbitrageOpportunities,
  fetchBitqueryData,
  fetchJupiterArbitrageData,
  monitorPumpFunTokens,
  trackRaydiumLiquidityEvents,
  monitorOrcaSwaps,
  calculateArbitrageProfitability,
  executeJupiterSwap,
  fetchSolanaTokenMetadata
} = require('./queries/arbitrageBitquery'); // Adjust path if necessary

// Run all test queries  
const runTests = async () => {
  try {
    console.log("\n🔍 Fetching Serum Arbitrage Opportunities...");
    const serumArbitrage = await fetchSerumArbitrageOpportunities();
    console.log("✅ Serum Arbitrage Opportunities:", JSON.stringify(serumArbitrage, null, 2));

    console.log("\n🔍 Fetching Raydium Arbitrage Opportunities...");
    const raydiumArbitrage = await fetchRaydiumArbitrageOpportunities();
    console.log("✅ Raydium Arbitrage Opportunities:", JSON.stringify(raydiumArbitrage, null, 2));

    console.log("\n🔍 Fetching Bitquery Data...");
    const bitqueryData = await fetchBitqueryData();
    console.log("✅ Bitquery Data:", JSON.stringify(bitqueryData, null, 2));

    console.log("\n🔍 Fetching Jupiter Arbitrage Data...");
    const jupiterArbitrage = await fetchJupiterArbitrageData();
    console.log("✅ Jupiter Arbitrage Data:", JSON.stringify(jupiterArbitrage, null, 2));

    console.log("\n🔍 Monitoring PumpFun Tokens...");
    const pumpFunTokens = await monitorPumpFunTokens();
    console.log("✅ PumpFun Tokens:", JSON.stringify(pumpFunTokens, null, 2));

    console.log("\n🔍 Tracking Raydium Liquidity Events...");
    const raydiumLiquidity = await trackRaydiumLiquidityEvents();
    console.log("✅ Raydium Liquidity Events:", JSON.stringify(raydiumLiquidity, null, 2));

    console.log("\n🔍 Monitoring Orca Swaps...");
    const orcaSwaps = await monitorOrcaSwaps();
    console.log("✅ Orca Swaps:", JSON.stringify(orcaSwaps, null, 2));

    console.log("\n🔍 Calculating Arbitrage Profitability...");
    const arbitrageProfitability = await calculateArbitrageProfitability();
    console.log("✅ Arbitrage Profitability:", JSON.stringify(arbitrageProfitability, null, 2));

    console.log("\n🔍 Executing Jupiter Swap...");
    const jupiterSwap = await executeJupiterSwap();
    console.log("✅ Jupiter Swap:", JSON.stringify(jupiterSwap, null, 2));

    console.log("\n🔍 Fetching Solana Token Metadata...");
    const solanaTokenMetadata = await fetchSolanaTokenMetadata();
    console.log("✅ Solana Token Metadata:", JSON.stringify(solanaTokenMetadata, null, 2));

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
runTests();
