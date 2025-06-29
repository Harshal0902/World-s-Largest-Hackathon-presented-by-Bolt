import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export const MarketOverview: React.FC = () => {
  const { cryptoData, marketData, loading } = useApp();
  const { isDark } = useTheme();

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Market Overview
      </h2>

      {/* Market Stats */}
      {marketData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Market Cap</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(marketData.totalMarketCap)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>24h Volume</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(marketData.totalVolume)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>BTC Dominance</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {marketData.btcDominance.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fear & Greed</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {marketData.fearGreedIndex}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                marketData.fearGreedIndex > 75 ? 'bg-red-500' :
                marketData.fearGreedIndex > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <span className="text-white text-xs font-bold">
                  {marketData.fearGreedIndex > 75 ? 'G' : marketData.fearGreedIndex > 50 ? 'N' : 'F'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Cryptocurrencies */}
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Top Cryptocurrencies
        </h3>
        
        {cryptoData.slice(0, 5).map((crypto, index) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
          >
            <div className="flex items-center space-x-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/32/3B82F6/FFFFFF?text=${crypto.symbol.toUpperCase()}`;
                }}
              />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {crypto.name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {crypto.symbol.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${crypto.current_price.toLocaleString()}
              </p>
              <div className="flex items-center justify-end space-x-1">
                {crypto.price_change_percentage_24h > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  crypto.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatPercent(crypto.price_change_percentage_24h)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};