const VOLUME_QUERY = `
{
  solana(network: solana) {
    dexTrades {
      baseCurrency {
        symbol
      }
      quoteCurrency {
        symbol
      }
      tradeAmount(in: USD)
    }
  }
}
`;

module.exports = VOLUME_QUERY;
