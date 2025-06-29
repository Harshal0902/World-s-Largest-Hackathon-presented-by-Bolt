import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoData, PortfolioItem, VoiceState, MarketData } from '../types';
import { cryptoService } from '../services/cryptoService';

interface AppContextType {
  cryptoData: CryptoData[];
  portfolioItems: PortfolioItem[];
  voiceState: VoiceState;
  marketData: MarketData | null;
  loading: boolean;
  error: string | null;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'currentPrice'>) => void;
  removePortfolioItem: (id: string) => void;
  updateVoiceState: (state: Partial<VoiceState>) => void;
  refreshMarketData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    conversation: []
  });

  const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'currentPrice'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: Date.now().toString(),
      currentPrice: item.purchasePrice // Will be updated with real data
    };
    setPortfolioItems(prev => [...prev, newItem]);
  };

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  const updateVoiceState = (state: Partial<VoiceState>) => {
    setVoiceState(prev => ({ ...prev, ...state }));
  };

  const refreshMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cryptoService.getTopCryptos();
      setCryptoData(data);
      
      // Mock market data - replace with real API
      setMarketData({
        totalMarketCap: 2.1e12,
        totalVolume: 86.5e9,
        btcDominance: 52.3,
        fearGreedIndex: 74
      });
    } catch (err) {
      setError('Failed to fetch market data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMarketData();
  }, []);

  return (
    <AppContext.Provider value={{
      cryptoData,
      portfolioItems,
      voiceState,
      marketData,
      loading,
      error,
      addPortfolioItem,
      removePortfolioItem,
      updateVoiceState,
      refreshMarketData
    }}>
      {children}
    </AppContext.Provider>
  );
};