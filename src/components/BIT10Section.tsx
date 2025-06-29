import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { BIT10Index } from '../types';

export const BIT10Section: React.FC = () => {
  const { isDark } = useTheme();

  const bit10Indices: BIT10Index[] = [
    {
      name: 'BIT10 TOP',
      symbol: 'BIT10.TOP',
      price: 1847.23,
      change24h: 3.45,
      description: 'Top 10 largest cryptocurrencies by market cap',
      composition: ['BTC', 'ETH', 'BNB', 'XRP', 'SOL', 'ADA', 'AVAX', 'DOT', 'MATIC', 'UNI']
    }
  ];

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          BIT10 Index Funds
        </h2>
        <Star className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {bit10Indices.map((index, i) => (
          <motion.div
            key={index.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {index.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {index.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${index.price.toLocaleString()}
                </p>
                <div className="flex items-center justify-end space-x-1">
                  {index.change24h > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    index.change24h > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {index.change24h > 0 ? '+' : ''}{index.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {index.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {index.composition.slice(0, 5).map((token) => (
                  <span
                    key={token}
                    className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {token}
                  </span>
                ))}
                {index.composition.length > 5 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    +{index.composition.length - 5} more
                  </span>
                )}
              </div>
              <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm">
                <Info className="h-4 w-4" />
                <span>Details</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              About BIT10 Index Funds
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              BIT10 index funds provide diversified exposure to cryptocurrency markets through professionally managed portfolios. Each fund tracks a specific segment of the crypto market with automatic rebalancing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};