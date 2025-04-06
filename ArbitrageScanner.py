import json
import os
import requests
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()  # ✅ Load .env variables into environment

# Define constants
CONTENT_TYPE_JSON = "Content-Type"
CONTENT_TYPE_JSON_VALUE = "application/json"
AUTHORIZATION = "Authorization"
BEARER_PREFIX = "Bearer "
EAP_ENDPOINT = "https://streaming.bitquery.io/eap"

class ArbitrageScanner:
    def __init__(self, api_key):
        """Initialize the scanner with an API key/token"""
        self.api_key = api_key
        self.base_url = EAP_ENDPOINT
        
    def execute_query(self, query, variables=None):
        """Execute a GraphQL query using X-API-KEY authentication"""
        headers = {
            CONTENT_TYPE_JSON: CONTENT_TYPE_JSON_VALUE,
            "X-API-KEY": self.api_key
        }
        print(f"[LOG] Sending request to {self.base_url}")
        print(f"[LOG] Headers: {headers}")
        
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        print(f"[LOG] Payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(self.base_url, json=payload, headers=headers)
            print(f"[LOG] Status Code: {response.status_code}")
            print(f"[LOG] Response: {response.text[:500]}")  # limit to avoid overload
            
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"[Error] Request failed: {e}")
            return None
        except json.JSONDecodeError:
            print("[Error] Failed to parse JSON")
            print(f"[LOG] Status Code: {response.status_code}")
            print(f"[LOG] Response: {response.text[:500]}")  # limit to avoid overload
            return None
        
    async def fetch_jupiter_arbitrage_data(self):
        """Fetch Jupiter arbitrage data from Bitquery"""
        query = """
        {
          Solana {
            Instructions(
              where: {
                Instruction: {
                  Program: {
                    Name: {in: ["Jupiter Aggregator v6"]}
                  }
                }
                Transaction: {
                  Result: {Success: true}
                }
              }
              limit: {count: 50}
              orderBy: {descending: Block_Time}
            ) {
              Transaction {
                Signature
              }
              Block {
                Time
              }
              Instruction {
                Program {
                  Name
                }
                Accounts {
                  Token {
                    Mint
                  }
                }
                Logs
              }
            }
          }
        }
        """
        
        return self.execute_query(query)
    
    async def process_arbitrage_opportunities(self):
        """Process arbitrage opportunities and rank them"""
        data = await self.fetch_jupiter_arbitrage_data()
        if not data or 'data' not in data or 'Solana' not in data['data'] or 'Instructions' not in data['data']['Solana']:
            print("[ERROR] Failed to fetch Jupiter arbitrage data")
            print(f"[LOG] Response: {data}")
            return []

        instructions = data['data']['Solana']['Instructions']
        opportunities = []
        
        for trade in instructions:
            opportunity = {
                'transaction': trade.get('Transaction', {}).get('Signature'),
                'timestamp': trade.get('Block', {}).get('Time'),
                'program': trade.get('Instruction', {}).get('Program', {}).get('Name', 'Unknown'),
                'buyToken': (trade.get('Instruction', {}).get('Accounts', [{}])[0] or {}).get('Token', {}).get('Mint', 'Unknown'),
                'sellToken': (trade.get('Instruction', {}).get('Accounts', [{}])[1] or {}).get('Token', {}).get('Mint', 'Unknown'),
                'logs': trade.get('Instruction', {}).get('Logs', [])
            }
            opportunities.append(opportunity)

        # Sort by latest timestamp
        return sorted(opportunities, key=lambda x: datetime.fromisoformat(x['timestamp'].replace('Z', '+00:00')), reverse=True)
    
    async def process_custom_arbitrage_query(self, query):
        """Process a custom arbitrage query"""
        data = await self.execute_query(query)  # Added await here
        if not data or 'data' not in data or 'Solana' not in data['data'] or 'Instructions' not in data['data']['Solana']:
            print("[ERROR] Failed to process custom arbitrage query")
            print(f"[LOG] Response: {data}")
            return []

        instructions = data['data']['Solana']['Instructions']
        results = []
        
        for trade in instructions:
            result = {
                'transaction': trade.get('Transaction', {}).get('Signature'),
                'timestamp': trade.get('Block', {}).get('Time'),
                'buyToken': (trade.get('Instruction', {}).get('Accounts', [{}])[0] or {}).get('Token', {}).get('Mint', 'Unknown'),
                'sellToken': (trade.get('Instruction', {}).get('Accounts', [{}])[1] or {}).get('Token', {}).get('Mint', 'Unknown')
            }
            results.append(result)
            
        return results
    
    async def fetch_token_price_history(self, token_address, days=7):
        """Fetch price history for a specific token"""
        print(f"\n=== Fetching Price History for {token_address} ===")
        
        query = """
        query TokenPriceHistory($token: String!, $since: ISO8601DateTime!) {
          Solana {
            DEXTrades(
              where: {
                Trade: {
                  Buy: {Currency: {MintAddress: {is: $token}}}
                }
                Block: {Time: {since: $since}}
              }
              limit: {count: 100}
              orderBy: {ascending: Block_Time}
            ) {
              Block {
                Time
              }
              Trade {
                Buy {
                  Price
                  PriceUSD
                }
                Dex {
                  ProtocolName
                }
              }
            }
          }
        }
        """
        
        # Calculate date from days ago
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        variables = {
            "token": token_address,
            "since": since_date
        }
        
        result = self.execute_query(query, variables)
        if result and 'data' in result and 'Solana' in result['data'] and 'DEXTrades' in result['data']['Solana']:
            trades = result['data']['Solana']['DEXTrades']
            print(f"Successfully fetched {len(trades)} price points")
            
            # Process and format the price data
            price_data = []
            for trade in trades:
                price_data.append({
                    'timestamp': trade['Block']['Time'],
                    'price': trade['Trade']['Buy']['Price'],
                    'priceUSD': trade['Trade']['Buy']['PriceUSD'],
                    'dex': trade['Trade']['Dex']['ProtocolName']
                })
            
            return price_data
        else:
            print("Failed to fetch token price history")
            return []

    async def find_arbitrage_opportunities(self, token_address=None, min_profit_percentage=1.0):
        """Find arbitrage opportunities for a specific token across different DEXes"""
        print(f"\n=== Finding Arbitrage Opportunities ===")
        
        # Default to SOL if no token address is provided
        if not token_address:
            token_address = "So11111111111111111111111111111111111111112"  # SOL token address
        
        query = """
        {
          Solana {
            DEXTrades(
              limit: {count: 100}
              orderBy: {descending: Block_Time}
              where: {
                Block: {Time: {after: "2023-04-01T00:00:00Z"}}
                Trade: {
                  Buy: {Currency: {MintAddress: {is: "%s"}}}
                }
              }
            ) {
              Block {
                Time
              }
              Transaction {
                Signature
              }
              Trade {
                Buy {
                  Price
                  PriceInUSD
                  Amount
                  Currency {
                    MintAddress
                    Name
                  }
                }
                Sell {
                  Currency {
                    MintAddress
                    Name
                  }
                  Amount
                }
                Dex {
                  ProtocolName
                }
              }
            }
          }
        }
        """ % token_address
        
        result = self.execute_query(query)
        
        if not result or 'data' not in result or not result['data'] or 'Solana' not in result['data'] or 'DEXTrades' not in result['data']['Solana']:
            print("[ERROR] Failed to fetch or parse arbitrage data")
            return []
        
        trades = result['data']['Solana']['DEXTrades']
        print(f"Successfully fetched {len(trades)} trades")
        
        # Process trades to find arbitrage opportunities
        opportunities = []
        dex_prices = {}
        
        for trade in trades:
            dex_name = trade['Trade']['Dex']['ProtocolName']
            price = trade['Trade']['Buy']['Price']
            price_usd = trade['Trade']['Buy']['PriceInUSD']
            timestamp = trade['Block']['Time']
            
            if dex_name not in dex_prices:
                dex_prices[dex_name] = []
            
            dex_prices[dex_name].append({
                'price': price,
                'price_usd': price_usd,
                'timestamp': timestamp,
                'signature': trade['Transaction']['Signature'],
                'buy_token': trade['Trade']['Buy']['Currency']['Name'],
                'sell_token': trade['Trade']['Sell']['Currency']['Name']
            })
        
        # Compare prices between DEXes
        if len(dex_prices.keys()) > 1:
            for dex1 in dex_prices:
                for dex2 in dex_prices:
                    if dex1 != dex2:
                        for trade1 in dex_prices[dex1]:
                            for trade2 in dex_prices[dex2]:
                                time1 = datetime.fromisoformat(trade1['timestamp'].replace('Z', '+00:00'))
                                time2 = datetime.fromisoformat(trade2['timestamp'].replace('Z', '+00:00'))
                                time_diff = abs((time1 - time2).total_seconds())
                                
                                if time_diff <= 300:
                                    price_diff_percent = ((trade2['price'] - trade1['price']) / trade1['price']) * 100
                                    
                                    if abs(price_diff_percent) >= min_profit_percentage:
                                        opportunities.append({
                                            'buy_dex': dex1,
                                            'sell_dex': dex2,
                                            'buy_price': trade1['price'],
                                            'sell_price': trade2['price'],
                                            'profit_percentage': price_diff_percent,
                                            'buy_timestamp': trade1['timestamp'],
                                            'sell_timestamp': trade2['timestamp'],
                                            'buy_signature': trade1['signature'],
                                            'sell_signature': trade2['signature'],
                                            'token': trade1['buy_token']
                                        })

        opportunities.sort(key=lambda x: abs(x['profit_percentage']), reverse=True)
        return opportunities

# Add a main function to test the scanner
async def main():
    print("\n=== Testing Arbitrage Scanner ===")
    
    api_key = os.getenv("BITQUERY_API_KEY")
    if not api_key:
        print("[ERROR] BITQUERY_API_KEY environment variable not found")
        print("Please set this in your .env file or environment")
        return
    
    print(f"[LOG] Using API key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else ''}")
    
    scanner = ArbitrageScanner(api_key)

    test_query = """
    {
      Solana {
        Blocks(limit: {count: 1}) {
          Time
          Height
        }
      }
    }
    """
    
    print("\n=== Testing API Authentication ===")
    test_result = scanner.execute_query(test_query)
    if test_result and 'data' in test_result:
        print("✅ Authentication successful!")
    else:
        print("❌ Authentication failed. Please check your API key.")
        return
    
    opportunities = await scanner.find_arbitrage_opportunities(
        token_address="So11111111111111111111111111111111111111112",
        min_profit_percentage=0.5
    )
    
    print(f"\n=== Found {len(opportunities)} Arbitrage Opportunities ===")
    for i, opp in enumerate(opportunities[:5], 1):
        print(f"\nOpportunity #{i}:")
        print(f"  Buy on: {opp['buy_dex']} at {opp['buy_price']}")
        print(f"  Sell on: {opp['sell_dex']} at {opp['sell_price']}")
        print(f"  Profit: {opp['profit_percentage']:.2f}%")
        print(f"  Timestamp: {opp['buy_timestamp']}")

if __name__ == "__main__":
    asyncio.run(main())
