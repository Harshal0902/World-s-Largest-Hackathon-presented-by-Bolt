import axios from 'axios';
import { CryptoData } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

class CryptoService {
  async getTopCryptos(limit = 10): Promise<CryptoData[]> {
    try {
      const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Return mock data for demo purposes
      return this.getMockCryptoData();
    }
  }

  async getCryptoById(id: string): Promise<CryptoData | null> {
    try {
      const response = await axios.get(`${COINGECKO_API}/coins/${id}`);
      return {
        id: response.data.id,
        symbol: response.data.symbol,
        name: response.data.name,
        current_price: response.data.market_data.current_price.usd,
        price_change_percentage_24h: response.data.market_data.price_change_percentage_24h,
        market_cap: response.data.market_data.market_cap.usd,
        total_volume: response.data.market_data.total_volume.usd,
        image: response.data.image.large
      };
    } catch (error) {
      console.error('Error fetching crypto by id:', error);
      return null;
    }
  }

  private getMockCryptoData(): CryptoData[] {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 67234.56,
        price_change_percentage_24h: 2.34,
        market_cap: 1.32e12,
        total_volume: 28.5e9,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 67000 + Math.sin(i/10) * 2000) }
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3456.78,
        price_change_percentage_24h: 1.67,
        market_cap: 415.2e9,
        total_volume: 15.8e9,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 3400 + Math.sin(i/8) * 200) }
      },
      {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        current_price: 0.4567,
        price_change_percentage_24h: -0.89,
        market_cap: 16.2e9,
        total_volume: 420e6,
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 0.45 + Math.sin(i/12) * 0.05) }
      }
    ];
  }
}

export const cryptoService = new CryptoService();