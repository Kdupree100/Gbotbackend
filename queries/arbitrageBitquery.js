 const axios = require("axios");

const BITQUERY_API_URL = "https://streaming.bitquery.io/eap";
const API_KEY = process.env.BITQUERY_API_KEY;

/**
 * Fetches real-time arbitrage data from Bitquery (Jupiter example)    we need more test classes 
 * @returns {Promise<Object|null>} Arbitrage trade data
 */
const fetchJupiterArbitrageData = async () => {
  const query = 
  subscription {
    Solana {
      Instructions(
        where: {
          Instruction: {
            Program: {
              Address: { is: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" },
              Method: { includes: "sharedAccountsRoute" }
            }
          },
          Transaction: {
            Result: { Success: true }
          }
        }
      ) {
        Instruction {
          Accounts {
            Address
            IsWritable
            Token {
              Mint
              Owner
              ProgramId
            }
          }
          Program {
            AccountNames
            Address
            Name
            Method
          }
          Logs
        }
        Transaction {
          Signature
          Signer
        }
        Block {
          Time
        }
      }
    }
  };

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: { "X-API-KEY": API_KEY },
      }
    );

    console.log("✅ Successfully fetched Jupiter Arbitrage data");
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching Jupiter Arbitrage data:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Monitors Pump.Fun tokens and calculates arbitrage opportunities
 * @returns {Promise<Object>}
 */
const monitorPumpFunTokens = async () => {
  const query = {
    Solana {
      PumpFunTrades: DEXTradeByTokens(
        limit: {count: 100}
        orderBy: {descending: Block_Time}
        where: {
          Trade: {
            Dex: { ProtocolName: { is: "pump" } }
          }
          Transaction: { Result: { Success: true } }
        }
      ) {
        Trade {
          Currency {
            Symbol
            Name
            MintAddress
            Decimals
            FungibleUri
          }
          Market {
            MarketAddress
          }
          Price
          PriceInUSD
          Dex {
            ProtocolName
          }
          Buy {
            Amount
            AmountInUSD
          }
          Sell {
            Amount
            AmountInUSD
          }
        }
        Block {
          Time
        }
        Transaction {
          Signature
          Signer
        }
      }
      
      TopPumpFunTokens: DEXTrades(
        limitBy: { by: Trade_Buy_Currency_MintAddress, count: 1 }
        limit: { count: 20 }
        orderBy: { descending: Trade_Buy_Price }
        where: {
          Trade: {
            Dex: { ProtocolName: { is: "pump" } },
            Buy: {
              Currency: {
                MintAddress: { notIn: ["11111111111111111111111111111111"] }
              },
              PriceInUSD: { gt: 0.00001 }
            }
          },
          Transaction: { Result: { Success: true } }
        }
      ) {
        Trade {
          Buy {
            Price(maximum: Block_Time)
            PriceInUSD(maximum: Block_Time)
            Currency {
              Name
              Symbol
              MintAddress
              Decimals
            }
          }
        }
      }
      
      RaydiumTrades: DEXTradeByTokens(
        limit: { count: 50 }
        where: {
          Trade: {
            Dex: { ProtocolName: { is: "raydium" } }
          },
          Transaction: { Result: { Success: true } },
          Block: { Time: { since: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" } }
        }
      ) {
        Trade {
          Currency {
            Symbol
            Name
            MintAddress
          }
          Price
          PriceInUSD
        }
        Block {
          Time
        }
      }
    }
  };

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

    const pumpFunTrades = response.data.data.Solana.PumpFunTrades;
    const topPumpFunTokens = response.data.data.Solana.TopPumpFunTokens;
    const raydiumTrades = response.data.data.Solana.RaydiumTrades;

    // 1. Calculate market caps for Pump.Fun tokens
    const pumpFunTokens = topPumpFunTokens.map(item => {
      const token = item.Trade.Buy.Currency;
      const priceUSD = item.Trade.Buy.PriceInUSD;

      return {
        symbol: token.Symbol || token.MintAddress.substring(0, 8),
        name: token.Name,
        mintAddress: token.MintAddress,
        priceUSD,
        marketCap: priceUSD * 1_000_000_000, // 1B supply
      };
    }).sort((a, b) => b.marketCap - a.marketCap);

    // 2. Find tokens that exist on both Pump.Fun and Raydium
    const pumpFunTokenAddresses = new Set(
      pumpFunTrades.map(trade => trade.Trade.Currency.MintAddress)
    );

    const graduatedTokens = raydiumTrades.filter(trade => 
      pumpFunTokenAddresses.has(trade.Trade.Currency.MintAddress)
    );

    const graduatedTokensMap = {};
    graduatedTokens.forEach(trade => {
      const mintAddress = trade.Trade.Currency.MintAddress;
      if (!graduatedTokensMap[mintAddress]) {
        graduatedTokensMap[mintAddress] = {
          symbol: trade.Trade.Currency.Symbol,
          name: trade.Trade.Currency.Name,
          mintAddress,
          raydiumPrice: trade.Trade.Price,
          raydiumPriceUSD: trade.Trade.PriceInUSD,
          timestamp: trade.Block.Time,
        };
      }
    });

    // 3. Find arbitrage opportunities
    const arbitrageOpportunities = [];

    Object.values(graduatedTokensMap).forEach(raydiumToken => {
      const pumpFunTrade = pumpFunTrades.find(
        trade => trade.Trade.Currency.MintAddress === raydiumToken.mintAddress
      );

      if (pumpFunTrade) {
        const pumpFunPrice = pumpFunTrade.Trade.PriceInUSD || pumpFunTrade.Trade.Price;
        const raydiumPrice = raydiumToken.raydiumPriceUSD || raydiumToken.raydiumPrice;
        const priceDiffPercent = Math.abs((pumpFunPrice - raydiumPrice) / pumpFunPrice * 100);

        if (priceDiffPercent > 2) {
          arbitrageOpportunities.push({
            token: raydiumToken.symbol || raydiumToken.mintAddress.substring(0, 8),
            mintAddress: raydiumToken.mintAddress,
            pumpFunPrice,
            raydiumPrice,
            priceDiffPercent,
            buyOn: pumpFunPrice < raydiumPrice ? 'Pump.Fun' : 'Raydium',
            sellOn: pumpFunPrice < raydiumPrice ? 'Raydium' : 'Pump.Fun',
            potentialProfit: priceDiffPercent,
            timestamp: pumpFunTrade.Block.Time,
          });
        }
      }
    });

    return {
      topTokensByMarketCap: pumpFunTokens,
      recentTrades: pumpFunTrades,
      arbitrageOpportunities: arbitrageOpportunities.sort((a, b) => b.potentialProfit - a.potentialProfit),
    };

  } catch (error) {
    console.error("❌ Error monitoring Pump.Fun tokens:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { fetchJupiterArbitrageData, monitorPumpFunTokens };


const fetchSerumArbitrageOpportunities = async () => {
    const query = {
      Solana {
        DEXTradeByTokens(
          limit: {count: 200}
          orderBy: {descending: Block_Time}
          where: {
            Trade: {
              Dex: {
                ProgramAddress: {
                  in: [
                    "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",  # Serum v3
                    "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",  # OpenBook
                    "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"   # OpenBook v2
                  ]
                }
              }
              Side: {
                Currency: {
                  MintAddress: {
                    in: [
                      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC
                      "So11111111111111111111111111111111111111112"    # SOL
                    ]
                  }
                }
              }
            }
            Transaction: {Result: {Success: true}}
          }
        ) {
          Trade {
            Currency { Symbol Name MintAddress }
            Market { MarketAddress }
            Price PriceInUSD
            Dex { ProgramAddress ProtocolName ProtocolFamily }
            Side { Currency { Symbol MintAddress } }
          }
          Block { Time }
          Transaction { Signature }
        }
      }
    };

    try {
        const response = await axios.post(
            BITQUERY_API_URL,
            { query },
            { headers: { 'X-API-KEY': API_KEY } }
        );

        const trades = response.data.data?.Solana?.DEXTradeByTokens || [];
        if (!trades.length) return [];

        const tokenPrices = groupTradesByToken(trades);

        return findArbitrageOpportunities(tokenPrices, 0.5); // Serum threshold 0.5%
        
    } catch (error) {
        console.error('❌ Error fetching Serum arbitrage opportunities:', error.response?.data || error.message);
        throw error;
    }
};

const fetchRaydiumArbitrageOpportunities = async () => {
    const query = {
      Solana {
        DEXTradeByTokens(
          limit: {count: 200}
          orderBy: {descending: Block_Time}
          where: {
            Trade: {
              Dex: { ProtocolFamily: { is: "Raydium" } }
              Side: {
                Currency: {
                  MintAddress: {
                    in: [
                      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC
                      "So11111111111111111111111111111111111111112"    # SOL
                    ]
                  }
                }
              }
            }
            Transaction: {Result: {Success: true}}
          }
        ) {
          Trade {
            Currency { Symbol Name MintAddress }
            Market { MarketAddress }
            Price PriceInUSD
            Dex { ProtocolName ProtocolFamily }
            Side { Currency { Symbol MintAddress } }
          }
          Block { Time }
          Transaction { Signature }
        }
      }
    };

    try {
        const response = await axios.post(
            BITQUERY_API_URL,
            { query },
            { headers: { 'X-API-KEY': API_KEY } }
        );

        const trades = response.data.data?.Solana?.DEXTradeByTokens || [];
        if (!trades.length) return [];

        const tokenPrices = groupTradesByToken(trades);

        return findArbitrageOpportunities(tokenPrices, 1); // Raydium threshold 1%

    } catch (error) {
        console.error('❌ Error fetching Raydium arbitrage opportunities:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Groups trade data by token and trading pair
 * @param {Array} trades - List of trade objects
 * @returns {Object} Grouped trade prices
 */
const groupTradesByToken = (trades) => {
    const tokenPrices = {};

    trades.forEach(trade => {
        const tokenMint = trade.Trade.Currency.MintAddress;
        const tokenSymbol = trade.Trade.Currency.Symbol || tokenMint.substring(0, 8);
        const baseMint = trade.Trade.Side.Currency.MintAddress;
        const baseSymbol = trade.Trade.Side.Currency.Symbol;
        const marketAddress = trade.Trade.Market.MarketAddress;
        const dexName = trade.Trade.Dex.ProtocolName;
        const price = trade.Trade.Price;
        const timestamp = trade.Block.Time;

        const key = ${tokenMint}_${baseMint};

        if (!tokenPrices[key]) {
            tokenPrices[key] = [];
        }

        tokenPrices[key].push({
            tokenSymbol,
            baseSymbol,
            marketAddress,
            dexName,
            price,
            timestamp
        });
    });

    return tokenPrices;
};

/**
 * Identifies arbitrage opportunities between different markets
 * @param {Object} tokenPrices - Token prices grouped by market
 * @param {Number} threshold - Minimum price difference percentage for arbitrage
 * @returns {Array} List of arbitrage opportunities
 */
const findArbitrageOpportunities = (tokenPrices, threshold) => {
    const arbitrageOpportunities = [];

    Object.keys(tokenPrices).forEach(tokenKey => {
        const [tokenMint, baseMint] = tokenKey.split('_');

        Object.keys(tokenPrices).forEach(otherKey => {
            const [otherTokenMint, otherBaseMint] = otherKey.split('_');

            if (tokenMint === otherTokenMint && baseMint !== otherBaseMint) {
                const market1 = tokenPrices[tokenKey][0];
                const market2 = tokenPrices[otherKey][0];

                const priceDiffPercent = Math.abs((market1.price - market2.price) / market1.price * 100);

                if (priceDiffPercent > threshold) {
                    arbitrageOpportunities.push({
                        token: market1.tokenSymbol,
                        market1: {
                            base: market1.baseSymbol,
                            price: market1.price,
                            marketAddress: market1.marketAddress,
                            dex: market1.dexName
                        },
                        market2: {
                            base: market2.baseSymbol,
                            price: market2.price,
                            marketAddress: market2.marketAddress,
                            dex: market2.dexName
                        },
                        priceDiffPercent
                    });
                }
            }
        });
    });

    return arbitrageOpportunities;
};

/**
 * General function to execute any Bitquery query
 * @param {string} query - GraphQL query string
 * @returns {Promise<Object|null>} Response data
 */
const fetchBitqueryData = async (query) => {
    try {
        const response = await axios.post(
            BITQUERY_API_URL,
            { query },
            { headers: { "X-API-KEY": API_KEY } }
        );

        return response.data.data;
    } catch (error) {
        console.error("❌ Error fetching Bitquery data:", error.response?.data || error.message);
        return null;
    }
};

module.exports = {
    fetchSerumArbitrageOpportunities,
    fetchRaydiumArbitrageOpportunities,
    fetchBitqueryData,
    fetchJupiterArbitrageData,
  monitorPumpFunTokens,
};