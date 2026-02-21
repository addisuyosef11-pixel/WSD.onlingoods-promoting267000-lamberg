// src/services/cryptoService.ts

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  last_updated: string;
}

export interface CryptoMarketData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

class CryptoService {
  private baseURL = 'https://api.coingecko.com/api/v3';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache

  private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`Using cached data for ${key}`);
      return cached.data as T;
    }

    try {
      console.log(`Fetching fresh data for ${key}`);
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      throw error;
    }
  }

  private async fetchAPI<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Get top 100 cryptocurrencies by market cap
  async getTopCryptos(perPage: number = 100): Promise<CryptoCoin[]> {
    return this.fetchWithCache(`top-${perPage}`, async () => {
      const url = `${this.baseURL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h,7d`;
      console.log('Fetching cryptos from:', url);
      return this.fetchAPI<CryptoCoin[]>(url);
    });
  }

  // Get global market data
  async getGlobalMarketData(): Promise<CryptoMarketData> {
    return this.fetchWithCache('global', async () => {
      const url = `${this.baseURL}/global`;
      const response = await this.fetchAPI<{ data: CryptoMarketData }>(url);
      return response.data;
    });
  }

  // Search cryptocurrencies
  async searchCryptos(query: string): Promise<CryptoCoin[]> {
    if (!query) return this.getTopCryptos(100);
    
    const allCoins = await this.getTopCryptos(250);
    return allCoins.filter(coin => 
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const cryptoService = new CryptoService();