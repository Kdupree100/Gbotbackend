const POOLS_QUERY = `
{
  solana(network: solana) {
    pools {
      address
      currency {
        symbol
      }
      liquidity
    }
  }
}
`;

module.exports = POOLS_QUERY;
