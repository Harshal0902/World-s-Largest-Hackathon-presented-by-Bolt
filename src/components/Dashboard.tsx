import React from 'react';
import { motion } from 'framer-motion';
import { MarketOverview } from './MarketOverview';
import { PortfolioSection } from './PortfolioSection';
import { BIT10Section } from './BIT10Section';
import { useTheme } from '../contexts/ThemeContext';

export const Dashboard: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome to BIT10 AI Advisor
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your AI-powered cryptocurrency financial advisor with voice interaction capabilities
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketOverview />
        <PortfolioSection />
      </div>

      {/* BIT10 Section */}
      <BIT10Section />

      {/* Quick Actions */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quick Voice Commands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "What's the price of Bitcoin?",
            "How is my portfolio performing?",
            "Tell me about BIT10 funds",
            "What's the market sentiment?",
            "Should I buy Ethereum now?",
            "Explain DeFi to me"
          ].map((command, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} cursor-pointer transition-colors`}
            >
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                "{command}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};