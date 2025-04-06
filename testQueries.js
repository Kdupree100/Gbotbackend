require('dotenv').config(); // Load environment variables  
const { fetchOHLC, fetchTopTraders, fetchPools, fetchVolume } = require('./services/bitqueryService');

// Run all test queries  
const runTests = async () => {
  try {
    console.log("\n🔍 Fetching OHLC Data...");
    const ohlcData = await fetchOHLC();
    console.log("✅ OHLC Data:", ohlcData);

    console.log("\n🔍 Fetching Top Traders...");
    const topTraders = await fetchTopTraders();
    console.log("✅ Top Traders:", topTraders);

    console.log("\n🔍 Fetching Liquidity Pools...");
    const pools = await fetchPools();
    console.log("✅ Liquidity Pools:", pools);

    console.log("\n🔍 Fetching Trading Volume...");
    const volume = await fetchVolume();
    console.log("✅ Trading Volume:", volume);

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
runTests();
