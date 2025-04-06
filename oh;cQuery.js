const OHLC_QUERY = `
{
  solana(network: solana) {
    dexTrades(options: {desc: ["timeInterval.minute"], limit: 100}) {
      timeInterval {
        minute(count: 1)
      }
      baseCurrency {
        symbol
      }
      quoteCurrency {
        symbol
      }
      open
      high
      low
      close
    }
  }
}
`;

module.exports = OHLC_QUERY;
