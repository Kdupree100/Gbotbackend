const { fetchJupiterArbitrageData, fetchBitqueryData } = require("../queries/arbitrageBitquery");

/**
 * Processes arbitrage opportunities and ranks them based on X-Factor scoring.
 * @returns {Promise<Array>} Ranked arbitrage opportunities
 */
const processArbitrageOpportunities = async () => {
  const data = await fetchJupiterArbitrageData();
  if (!data) return [];

  const opportunities = data.Solana.Instructions.map((trade) => ({
    transaction: trade.Transaction.Signature,
    timestamp: trade.Block.Time,
    program: trade.Instruction.Program.Name,
    buyToken: trade.Instruction.Accounts[0]?.Token?.Mint || "Unknown",
    sellToken: trade.Instruction.Accounts[1]?.Token?.Mint || "Unknown",
    logs: trade.Instruction.Logs,
  }));

  // Sort by latest timestamp
  return opportunities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Fetches and processes a custom Bitquery arbitrage query
 * @param {string} query - The Bitquery GraphQL query
 * @returns {Promise<Array>} Processed arbitrage data
 */
const processCustomArbitrageQuery = async (query) => {
  const data = await fetchBitqueryData(query);
  if (!data) return [];

  return data.Solana.Instructions.map((trade) => ({
    transaction: trade.Transaction.Signature,
    timestamp: trade.Block.Time,
    buyToken: trade.Instruction.Accounts[0]?.Token?.Mint || "Unknown",
    sellToken: trade.Instruction.Accounts[1]?.Token?.Mint || "Unknown",
  }));
};

module.exports = {
  processArbitrageOpportunities,
  processCustomArbitrageQuery, // Allows running custom queries
};
