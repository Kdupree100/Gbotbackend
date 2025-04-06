const axios = require('axios');

const BITQUERY_API_URL = 'https://streaming.bitquery.io/eap'; // EAP endpoint for Solana
const API_KEY = process.env.BITQUERY_API_KEY;  // ✅ Use API Key from .env

/**
 * Fetches the top trades from Solana DEXs
 * @returns {Promise<Array>} List of top trades
 */
const fetchTopTrades = async () => {
  const query = `{
  Solana {
    DEXTrades(
      orderBy: {descendingByField: "Trade_Buy_AmountInUSD"}
      limit: {count: 10}
      where: {Transaction: {Result: {Success: true}}}
    ) {
      Transaction {
        Signature
      }
      Trade {
        Dex {
          ProtocolName
        }
        Buy {
          Amount
          AmountInUSD
          Currency {
            Symbol
          }
          Account {
            Address
          }
        }
        Sell {
          Currency {
            Symbol
          }
          Account {
            Address
          }
        }
      }
      Block {
        Time
      }
    }
  }
}`;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          'X-API-KEY': API_KEY,
        },
      }
    );

    // Extract and return only necessary data
    return response.data.data.Solana.DEXTrades.map(trade => ({
      transactionHash: trade.Transaction.Signature,
      tradeAmountUSD: trade.Trade.Buy.AmountInUSD,
      buyToken: trade.Trade.Buy.Currency.Symbol,
      sellToken: trade.Trade.Sell.Currency.Symbol,
      buyer: trade.Trade.Buy.Account.Address,
      seller: trade.Trade.Sell.Account.Address,
      timestamp: trade.Block.Time,
      dex: trade.Trade.Dex.ProtocolName
    }));

  } catch (error) {
    console.error('❌ Error fetching top trades from Bitquery:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches OHLC data for SOL/USDC pair
 * @returns {Promise<Array>} List of OHLC candles
 */
const fetchOHLC = async () => {
  const query = `{
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "Block_Time"}
      where: {
        Trade: {
          Currency: {MintAddress: {is: "So11111111111111111111111111111111111111112"}},
          Side: {Currency: {MintAddress: {is: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}}}
        }
      }
      limit: {count: 100}
    ) {
      Block {
        Time(interval: {in: minutes, count: 5})
      }
      volume: sum(of: Trade_Amount)
      Trade {
        high: Price(maximum: Trade_Price)
        low: Price(minimum: Trade_Price)
        open: Price(minimum: Block_Slot)
        close: Price(maximum: Block_Slot)
      }
      count
    }
  }
}`;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          'X-API-KEY': API_KEY,
        },
      }
    );

    // Extract and return formatted OHLC data
    return response.data.data.Solana.DEXTradeByTokens.map(candle => ({
      timestamp: candle.Block.Time,
      open: candle.Trade.open,
      high: candle.Trade.high,
      low: candle.Trade.low,
      close: candle.Trade.close,
      volume: candle.volume,
      tradeCount: candle.count,
      pair: "SOL/USDC"
    }));

  } catch (error) {
    console.error('❌ Error fetching OHLC data from Bitquery:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches top traders by volume
 * @returns {Promise<Array>} List of top traders
 */
const fetchTopTraders = async () => {
  const query = `{
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "volumeUsd"}
      limit: {count: 10}
      where: {
        Trade: {
          Currency: {MintAddress: {is: "So11111111111111111111111111111111111111112"}},
          Side: {
            Amount: {gt: "0"},
            Currency: {MintAddress: {is: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}}
          }
        },
        Transaction: {Result: {Success: true}}
      }
    ) {
      Trade {
        Account {
          Owner
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
      }
      bought: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: buy}}}})
      sold: sum(of: Trade_Amount, if: {Trade: {Side: {Type: {is: sell}}}})
      volume: sum(of: Trade_Amount)
      volumeUsd: sum(of: Trade_Side_AmountInUSD)
    }
  }
}`;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          'X-API-KEY': API_KEY,
        },
      }
    );

    // Extract and return formatted trader data
    return response.data.data.Solana.DEXTradeByTokens.map(trader => ({
      traderAddress: trader.Trade.Account.Owner,
      volumeUSD: trader.volumeUsd,
      totalVolume: trader.volume,
      boughtAmount: trader.bought,
      soldAmount: trader.sold,
      dex: trader.Trade.Dex.ProtocolName,
      protocolFamily: trader.Trade.Dex.ProtocolFamily,
      pair: "SOL/USDC"
    }));

  } catch (error) {
    console.error('❌ Error fetching top traders from Bitquery:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches top liquidity pools
 * @returns {Promise<Array>} List of top pools
 */
const fetchPools = async () => {
  const query = `{
  Solana {
    DEXPools(
      orderBy: {descendingByField: "Pool_Quote_PostAmountInUSD"}
      limit: {count: 10}
      where: {
        Transaction: {Result: {Success: true}}
        Block: {Time: {after: "2024-01-01T00:00:00Z"}}
      }
    ) {
      Pool {
        Market {
          MarketAddress
          BaseCurrency {
            MintAddress
            Symbol
            Name
          }
          QuoteCurrency {
            MintAddress
            Symbol
            Name
          }
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        Base {
          PostAmount
          PostAmountInUSD
        }
        Quote {
          PostAmount
          PostAmountInUSD
        }
      }
    }
  }
}`;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          'X-API-KEY': API_KEY,
        },
      }
    );

    // Extract and return formatted pool data
    return response.data.data.Solana.DEXPools.map(pool => ({
      poolAddress: pool.Pool.Market.MarketAddress,
      baseToken: pool.Pool.Market.BaseCurrency.Symbol,
      baseTokenAddress: pool.Pool.Market.BaseCurrency.MintAddress,
      quoteToken: pool.Pool.Market.QuoteCurrency.Symbol,
      quoteTokenAddress: pool.Pool.Market.QuoteCurrency.MintAddress,
      baseAmount: pool.Pool.Base.PostAmount,
      baseAmountUSD: pool.Pool.Base.PostAmountInUSD,
      quoteAmount: pool.Pool.Quote.PostAmount,
      quoteAmountUSD: pool.Pool.Quote.PostAmountInUSD,
      totalLiquidityUSD: parseFloat(pool.Pool.Base.PostAmountInUSD) + parseFloat(pool.Pool.Quote.PostAmountInUSD),
      dex: pool.Pool.Dex.ProtocolName,
      protocolFamily: pool.Pool.Dex.ProtocolFamily
    }));

  } catch (error) {
    console.error('❌ Error fetching pools from Bitquery:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches top tokens by trading volume
 * @returns {Promise<Array>} List of top tokens by volume
 */
const fetchVolume = async () => {
  const query = `{
  Solana {
    DEXTradeByTokens(
      where: {
        Block: {Time: {since: "2024-03-01T00:00:00Z"}},
        Transaction: {Result: {Success: true}}
      }
      orderBy: {descendingByField: "traded_volume_USD"}
      limit: {count: 10}
    ) {
      Trade {
        Currency {
          MintAddress
          Name
          Symbol
          Decimals
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        Side {
          Currency {
            Name
            MintAddress
            Symbol
          }
        }
      }
      traded_volume_USD: sum(of: Trade_Side_AmountInUSD)
      traded_volume: sum(of: Trade_Amount)
      buy_volume: sum(of: Trade_Side_AmountInUSD, if: {Trade: {Side: {Type: {is: buy}}}})
      sell_volume: sum(of: Trade_Side_AmountInUSD, if: {Trade: {Side: {Type: {is: sell}}}})
      trades_count: count
    }
  }
}`;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          'X-API-KEY': API_KEY,
        },
      }
    );

    // Extract and return formatted volume data
    return response.data.data.Solana.DEXTradeByTokens.map(token => ({
      tokenAddress: token.Trade.Currency.MintAddress,
      tokenSymbol: token.Trade.Currency.Symbol,
      tokenName: token.Trade.Currency.Name,
      decimals: token.Trade.Currency.Decimals,
      volumeUSD: token.traded_volume_USD,
      volume: token.traded_volume,
      buyVolumeUSD: token.buy_volume,
      sellVolumeUSD: token.sell_volume,
      tradeCount: token.trades_count,
      pairedWith: token.Trade.Side.Currency.Symbol,
      pairedTokenAddress: token.Trade.Side.Currency.MintAddress,
      dex: token.Trade.Dex.ProtocolName,
      protocolFamily: token.Trade.Dex.ProtocolFamily
    }));

  } catch (error) {
    console.error('❌ Error fetching volume data from Bitquery:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { fetchOHLC, fetchTopTraders, fetchPools, fetchVolume, fetchTopTrades };