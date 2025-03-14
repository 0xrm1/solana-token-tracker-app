import React, { useState } from 'react';

export function BuySellModule() {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [priority, setPriority] = useState('50');
  const [showSettings, setShowSettings] = useState(false);

  // Mod değiştirme işlevi
  const toggleMode = (newMode: 'buy' | 'sell') => {
    setMode(newMode);
  };

  // Hızlı miktar seçimi
  const selectQuickAmount = (value: string) => {
    setAmount(value);
  };

  return (
    <div className="w-full bg-[#243447] rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Module 6 (Buy-Sell)</h2>
      
      {/* Mode Switcher */}
      <div className="flex bg-[#1b2839] rounded-lg p-1 mb-4">
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'buy' 
              ? 'bg-[#c8ec64] text-[#1b2839]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => toggleMode('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'sell' 
              ? 'bg-[#c8ec64] text-[#1b2839]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => toggleMode('sell')}
        >
          Sell
        </button>
      </div>
      
      {/* Token Address Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">CA:</label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter token address..."
          className="w-full px-3 py-2 bg-[#1b2839] border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#c8ec64]"
        />
      </div>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Amount:</label>
        <div className="flex">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={mode === 'buy' ? "SOL amount..." : "Token amount..."}
            className="flex-1 px-3 py-2 bg-[#1b2839] border border-gray-700 rounded-l text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#c8ec64]"
          />
          <div className="bg-[#1b2839] border border-l-0 border-gray-700 rounded-r px-3 py-2 text-white text-sm flex items-center">
            {mode === 'buy' ? 'SOL' : 'Token'}
          </div>
        </div>
      </div>
      
      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {mode === 'buy' ? (
          // Buy mode quick amounts
          <>
            <button
              onClick={() => selectQuickAmount('1')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              1 SOL
            </button>
            <button
              onClick={() => selectQuickAmount('2')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              2 SOL
            </button>
            <button
              onClick={() => selectQuickAmount('3')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              3 SOL
            </button>
          </>
        ) : (
          // Sell mode quick percentages
          <>
            <button
              onClick={() => selectQuickAmount('25%')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              25%
            </button>
            <button
              onClick={() => selectQuickAmount('50%')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              50%
            </button>
            <button
              onClick={() => selectQuickAmount('100%')}
              className="bg-[#1b2839] hover:bg-opacity-80 text-white text-sm py-2 rounded transition-colors"
            >
              100%
            </button>
          </>
        )}
      </div>
      
      {/* Action Button */}
      <button
        className={`w-full py-2 rounded font-medium text-sm mb-4 ${
          mode === 'buy'
            ? 'bg-[#c8ec64] text-[#1b2839] hover:bg-opacity-90'
            : 'bg-red-500 text-white hover:bg-opacity-90'
        }`}
      >
        {mode === 'buy' ? 'Buy Token' : 'Sell Token'}
      </button>
      
      {/* Settings Toggle */}
      <div className="mb-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Settings {showSettings ? '▲' : '▼'}
        </button>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[#1b2839] p-3 rounded mb-2">
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Slippage (%):</label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              min="0.1"
              max="100"
              step="0.1"
              className="w-full px-3 py-1 bg-[#243447] border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c8ec64]"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority (1-100):</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              min="1"
              max="100"
              step="1"
              className="w-full px-3 py-1 bg-[#243447] border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#c8ec64]"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Düşük</span>
              <span>Orta</span>
              <span>Yüksek</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Text */}
      <p className="text-xs text-gray-500 mt-2">
        {mode === 'buy' 
          ? 'Enter a token address and amount to buy.' 
          : 'Enter a token address and amount to sell.'}
      </p>
    </div>
  );
} 