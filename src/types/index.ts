export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  currentPrice: number;
  image: string;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  conversation: ConversationItem[];
}

export interface ConversationItem {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

export interface BIT10Index {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  description: string;
  composition: string[];
}

export interface MarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  fearGreedIndex: number;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}