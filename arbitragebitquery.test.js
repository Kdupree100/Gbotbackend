const nock = require("nock");
const {
  fetchJupiterArbitrageData,
  monitorPumpFunTokens,
  fetchSerumArbitrageOpportunities,
  fetchRaydiumArbitrageOpportunities,
  fetchBitqueryData,
} = require("../queries/arbitrageBitquery");

const BITQUERY_API_URL = "https://streaming.bitquery.io/eap";

describe("ArbitrageBitquery Tests", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test("fetchJupiterArbitrageData - should return mock data", async () => {
    const mockResponse = { data: { Solana: { Instructions: [] } } };

    nock(BITQUERY_API_URL)
      .post("/")
      .reply(200, { data: mockResponse });

    const data = await fetchJupiterArbitrageData();
    expect(data).toEqual(mockResponse);
  });

  test("monitorPumpFunTokens - should return mock token data", async () => {
    const mockResponse = {
      data: {
        Solana: {
          PumpFunTrades: [],
          TopPumpFunTokens: [],
          RaydiumTrades: [],
        },
      },
    };

    nock(BITQUERY_API_URL)
      .post("/")
      .reply(200, { data: mockResponse });

    const data = await monitorPumpFunTokens();
    expect(data).toHaveProperty("topTokensByMarketCap");
    expect(data).toHaveProperty("recentTrades");
    expect(data).toHaveProperty("arbitrageOpportunities");
  });

  test("fetchSerumArbitrageOpportunities - should return mock arbitrage opportunities", async () => {
    const mockResponse = {
      data: { Solana: { DEXTradeByTokens: [] } },
    };

    nock(BITQUERY_API_URL)
      .post("/")
      .reply(200, { data: mockResponse });

    const data = await fetchSerumArbitrageOpportunities();
    expect(data).toEqual([]);
  });

  test("fetchRaydiumArbitrageOpportunities - should return mock arbitrage opportunities", async () => {
    const mockResponse = {
      data: { Solana: { DEXTradeByTokens: [] } },
    };

    nock(BITQUERY_API_URL)
      .post("/")
      .reply(200, { data: mockResponse });

    const data = await fetchRaydiumArbitrageOpportunities();
    expect(data).toEqual([]);
  });

  test("fetchBitqueryData - should return mock data for general query", async () => {
    const mockQuery = `{ Solana { DEXTradeByTokens { Trade { Price } } } }`;
    const mockResponse = {
      data: { Solana: { DEXTradeByTokens: [{ Trade: { Price: 1.5 } }] } },
    };

    nock(BITQUERY_API_URL)
      .post("/")
      .reply(200, { data: mockResponse });

    const data = await fetchBitqueryData(mockQuery);
    expect(data).toEqual(mockResponse.data);
  });

  test("fetchJupiterArbitrageData - should return null on error", async () => {
    nock(BITQUERY_API_URL)
      .post("/")
      .reply(500, { error: "Internal Server Error" });

    const data = await fetchJupiterArbitrageData();
    expect(data).toBeNull();
  });
});
