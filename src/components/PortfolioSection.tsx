import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export const PortfolioSection: React.FC = () => {
  const { portfolioItems, addPortfolioItem, removePortfolioItem, cryptoData } = useApp();
  const { isDark } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    amount: '',
    purchasePrice: '',
    image: ''
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.amount || !formData.purchasePrice) return;
    
    const crypto = cryptoData.find(c => c.symbol.toLowerCase() === formData.symbol.toLowerCase());
    
    addPortfolioItem({
      symbol: formData.symbol.toLowerCase(),
      name: formData.name || crypto?.name || formData.symbol.toUpperCase(),
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice),
      image: crypto?.image || `https://via.placeholder.com/32/3B82F6/FFFFFF?text=${formData.symbol.toUpperCase()}`
    });
    
    setFormData({ symbol: '', name: '', amount: '', purchasePrice: '', image: '' });
    setShowAddForm(false);
  };

  const calculatePortfolioValue = () => {
    return portfolioItems.reduce((total, item) => {
      const crypto = cryptoData.find(c => c.symbol === item.symbol);
      const currentPrice = crypto?.current_price || item.purchasePrice;
      return total + (item.amount * currentPrice);
    }, 0);
  };

  const calculatePortfolioChange = () => {
    const totalInvested = portfolioItems.reduce((total, item) => total + (item.amount * item.purchasePrice), 0);
    const currentValue = calculatePortfolioValue();
    return totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  };

  const totalValue = calculatePortfolioValue();
  const totalChange = calculatePortfolioChange();

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Portfolio
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white p-2 rounded-lg transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-500" />
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
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total P&L</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                </p>
                {totalChange >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Holdings</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {portfolioItems.length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add Portfolio Item Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddItem}
            className={`mb-6 p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symbol (e.g., BTC)"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-blue-500`}
                required
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-blue-500`}
              />
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-blue-500`}
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Purchase Price"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-lg"
              >
                Add Asset
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Portfolio Items */}
      <div className="space-y-3">
        {portfolioItems.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No portfolio items yet. Add your first asset to get started!</p>
          </div>
        ) : (
          portfolioItems.map((item, index) => {
            const crypto = cryptoData.find(c => c.symbol === item.symbol);
            const currentPrice = crypto?.current_price || item.purchasePrice;
            const currentValue = item.amount * currentPrice;
            const investedValue = item.amount * item.purchasePrice;
            const profitLoss = currentValue - investedValue;
            const profitLossPercent = (profitLoss / investedValue) * 100;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${item.symbol.toUpperCase()}`;
                    }}
                  />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.amount} {item.symbol.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${currentValue.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-sm font-medium ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} ({profitLossPercent.toFixed(2)}%)
                    </span>
                    <button
                      onClick={() => removePortfolioItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};