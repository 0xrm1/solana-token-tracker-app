import React, { useState, useEffect } from 'react';
import { TokenPrice, getTokenPrices, getTokenInfoByMint } from '@/lib/jupiter-api';
import { cn } from '@/lib/utils';
import { createWallet, getWallet, getWalletBalance, shortenAddress, deleteWallet } from '@/lib/solana-wallet';

export function Watchlist() {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTokenMint, setNewTokenMint] = useState('');
  const [addingToken, setAddingToken] = useState(false);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);
  
  // Cüzdan durumu
  const [wallet, setWallet] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        if (Array.isArray(parsedWatchlist)) {
          setWatchlist(parsedWatchlist);
          // If there are tokens in the watchlist, fetch prices
          if (parsedWatchlist.length > 0) {
            fetchPrices(parsedWatchlist);
          }
        }
      } catch (err) {
        console.error('Error loading watchlist:', err);
      }
    }
    
    // Cüzdan bilgilerini yükle
    const existingWallet = getWallet();
    if (existingWallet) {
      setWallet(existingWallet);
      fetchWalletBalance(existingWallet.publicKey);
    }
  }, []);

  // Update prices periodically
  useEffect(() => {
    // If watchlist is empty, do nothing
    if (watchlist.length === 0) return;
    
    // Update every 30 seconds
    const intervalId = setInterval(() => {
      fetchPrices(watchlist);
    }, 30000);
    
    // Cleanup function
    return () => clearInterval(intervalId);
  }, [watchlist]);
  
  // Fetch prices
  const fetchPrices = async (mints: string[]) => {
    if (mints.length === 0) {
      setTokenPrices([]);
      return;
    }
    
    try {
      setIsLoading(true);
      // Get prices for tokens in the watchlist
      const prices = await getTokenPrices(mints);
      
      // If no prices are returned, show error
      if (prices.length === 0) {
        setError("Could not fetch token prices. Please try again later or add valid tokens.");
      } else {
        setTokenPrices(prices);
        setLastUpdateTime(new Date().toLocaleTimeString());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('An error occurred while loading prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new token
  const addToken = async () => {
    if (!newTokenMint || newTokenMint.trim() === '') {
      setError('Please enter a valid token mint address.');
      return;
    }

    try {
      setAddingToken(true);
      setError(null);
      
      // Clean mint address
      const mintAddress = newTokenMint.trim();
      
      // Check if token is already in watchlist
      if (watchlist.includes(mintAddress)) {
        setError('This token is already in your watchlist.');
        return;
      }
      
      // Check if token is valid
      const tokenInfo = await getTokenInfoByMint(mintAddress);
      
      if (tokenInfo) {
        // Add to watchlist
        const updatedWatchlist = [...watchlist, mintAddress];
        setWatchlist(updatedWatchlist);
        
        // Save to localStorage
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        
        // Clear form
        setNewTokenMint('');
        setShowAddForm(false);
        
        // Update prices
        await fetchPrices(updatedWatchlist);
      } else {
        setError('Valid token not found. Please make sure you entered the correct mint address.');
      }
    } catch (err) {
      console.error('Error adding token:', err);
      setError('An error occurred while adding the token. Please try again later.');
    } finally {
      setAddingToken(false);
    }
  };

  // Remove token from watchlist
  const removeToken = (mint: string) => {
    const updatedWatchlist = watchlist.filter(item => item !== mint);
    setWatchlist(updatedWatchlist);
    
    // Save to localStorage
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    
    // Update prices
    if (updatedWatchlist.length > 0) {
      fetchPrices(updatedWatchlist);
    } else {
      setTokenPrices([]);
    }
  };

  // Format price change as percentage
  const formatPriceChange = (change?: number) => {
    if (change === undefined || isNaN(change)) return '0.00%';
    const absChange = Math.abs(change);
    return `${absChange.toFixed(2)}%`;
  };
  
  // Format price (USDC)
  const formatPrice = (price: number | undefined) => {
    // If price is undefined or invalid, show default value
    if (price === undefined || isNaN(price)) {
      return '$0.00';
    }
    
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  // Format market cap
  const formatMarketCap = (marketCap: number | undefined) => {
    if (marketCap === undefined || isNaN(marketCap)) {
      return 'N/A';
    }
    
    // For billions
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    }
    // For millions
    else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    }
    // For thousands
    else if (marketCap >= 1_000) {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    }
    // For other cases
    else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  // Copy mint address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMint(text);
      setTimeout(() => setCopiedMint(null), 2000);
    });
  };

  // Truncate mint address for display
  const truncateMint = (mint: string) => {
    if (!mint) return '';
    return `${mint.slice(0, 6)}...${mint.slice(-4)}`;
  };

  // Truncate token name
  const truncateName = (name: string) => {
    if (!name) return '';
    return name.length > 10 ? name.substring(0, 10) : name;
  };

  // Handle key press in input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addToken();
    }
  };
  
  // Cüzdan oluştur
  const handleCreateWallet = async () => {
    try {
      setIsCreatingWallet(true);
      setError(null);
      
      const newWallet = await createWallet();
      setWallet(newWallet);
      
      // Bakiyeyi sorgula
      await fetchWalletBalance(newWallet.publicKey);
      
      setShowWalletOptions(false);
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('An error occurred while creating the wallet. Please try again later.');
    } finally {
      setIsCreatingWallet(false);
    }
  };
  
  // Cüzdan bakiyesini sorgula
  const fetchWalletBalance = async (publicKey: string) => {
    try {
      setIsLoadingBalance(true);
      const balance = await getWalletBalance(publicKey);
      setWalletBalance(balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  // Cüzdanı sil
  const handleDeleteWallet = () => {
    deleteWallet();
    setWallet(null);
    setWalletBalance(0);
    setShowWalletOptions(false);
  };
  
  // Cüzdan adresini kopyala
  const copyWalletAddress = () => {
    if (wallet) {
      copyToClipboard(wallet.publicKey);
    }
  };
  
  // Private key'i kopyala
  const copyPrivateKey = () => {
    if (wallet) {
      copyToClipboard(wallet.privateKey);
      setCopiedPrivateKey(true);
      setTimeout(() => setCopiedPrivateKey(false), 2000);
    }
  };

  // Cüzdan bakiyesini periyodik olarak güncelle
  useEffect(() => {
    if (!wallet) return;
    
    // İlk bakiye sorgulaması
    fetchWalletBalance(wallet.publicKey);
    
    // Her 30 saniyede bir bakiyeyi güncelle
    const intervalId = setInterval(() => {
      if (wallet) {
        fetchWalletBalance(wallet.publicKey);
      }
    }, 30000);
    
    // Cleanup function
    return () => clearInterval(intervalId);
  }, [wallet]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        {/* Cüzdan Bölümü */}
        <div className="relative">
          {wallet ? (
            <div 
              className="flex items-center bg-[#243447] rounded-lg px-2 py-1 cursor-pointer hover:bg-[#1b2839] transition-colors"
              onClick={() => setShowWalletOptions(!showWalletOptions)}
            >
              <div className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#c8ec64]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white">{shortenAddress(wallet.publicKey)}</span>
                <div className="flex items-center">
                  <span className="text-xs text-[#c8ec64]">{walletBalance.toFixed(4)} SOL</span>
                  {isLoadingBalance && (
                    <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#c8ec64] animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletOptions(!showWalletOptions)}
              className="flex items-center bg-[#243447] rounded-lg px-2 py-1 hover:bg-[#1b2839] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#c8ec64] mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-white">Cüzdan</span>
            </button>
          )}
          
          {/* Cüzdan Seçenekleri */}
          {showWalletOptions && (
            <div className="absolute top-full left-0 mt-1 bg-[#243447] rounded-lg shadow-lg z-10 w-64">
              {wallet ? (
                <div className="p-2">
                  <div className="mb-2">
                    <div className="text-xs text-gray-400 mb-1">Cüzdan Adresi:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white">{shortenAddress(wallet.publicKey, 8)}</span>
                      <button 
                        onClick={copyWalletAddress}
                        className="text-gray-400 hover:text-[#c8ec64] transition-colors"
                        title="Cüzdan adresini kopyala"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs text-gray-400 mb-1">Bakiye:</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white">{walletBalance.toFixed(6)} SOL</div>
                      {isLoadingBalance ? (
                        <div className="text-xs text-[#c8ec64] animate-pulse">Yükleniyor...</div>
                      ) : (
                        <button
                          onClick={() => fetchWalletBalance(wallet.publicKey)}
                          className="text-xs text-[#c8ec64] hover:underline"
                        >
                          Yenile
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Private Key Bölümü */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">Private Key:</div>
                      <button 
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-xs text-[#c8ec64] hover:underline"
                      >
                        {showPrivateKey ? 'Gizle' : 'Göster'}
                      </button>
                    </div>
                    
                    {showPrivateKey && (
                      <div className="mt-1 p-1 bg-[#1b2839] rounded border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white overflow-hidden text-ellipsis w-48">
                            {wallet.privateKey.substring(0, 20)}...
                          </div>
                          <button 
                            onClick={copyPrivateKey}
                            className="text-gray-400 hover:text-[#c8ec64] transition-colors ml-1"
                            title="Private key'i kopyala"
                          >
                            {copiedPrivateKey ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <div className="mt-1 text-[10px] text-red-400">
                          Uyarı: Private key'inizi asla paylaşmayın!
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => fetchWalletBalance(wallet.publicKey)}
                      className="text-xs bg-[#1b2839] text-white px-2 py-1 rounded hover:bg-opacity-80 transition-colors"
                      disabled={isLoadingBalance}
                    >
                      {isLoadingBalance ? (
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse mr-1"></span>
                          Yükleniyor
                        </span>
                      ) : (
                        'Yenile'
                      )}
                    </button>
                    <button
                      onClick={handleDeleteWallet}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-opacity-80 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <button
                    onClick={handleCreateWallet}
                    disabled={isCreatingWallet}
                    className="w-full text-xs bg-[#c8ec64] text-[#1b2839] px-2 py-1 rounded hover:bg-opacity-80 transition-colors font-medium"
                  >
                    {isCreatingWallet ? 'Oluşturuluyor...' : 'Cüzdan Oluştur'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Token Ekleme Butonu */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-6 h-6 bg-[#c8ec64] text-[#1b2839] rounded-full hover:bg-opacity-80 transition-colors text-xs font-bold flex items-center justify-center"
        >
          {showAddForm ? '×' : '+'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-3 py-2 rounded mb-4 text-xs">
          {error}
        </div>
      )}
      
      {showAddForm && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTokenMint}
              onChange={(e) => setNewTokenMint(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter token mint address"
              className="flex-1 px-3 py-1 border border-gray-600 bg-[#1b2839] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#c8ec64] text-xs"
              disabled={addingToken}
              autoFocus
            />
            <button
              onClick={addToken}
              className="px-3 py-1 bg-[#c8ec64] text-[#1b2839] rounded hover:bg-opacity-80 transition-colors font-medium text-xs"
              disabled={addingToken}
            >
              {addingToken ? '...' : 'Add'}
            </button>
          </div>
        </div>
      )}
      
      {watchlist.length > 0 ? (
        <div className="space-y-2">
          {isLoading ? (
            // Show placeholder cards when loading
            Array(watchlist.length).fill(0).map((_, index) => (
              <div key={`loading-${index}`} className="bg-[#243447] rounded-lg p-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-700 mr-2"></div>
                    <div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                      <div className="h-2 bg-gray-700 rounded w-20 mt-1"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            ))
          ) : (
            tokenPrices.map((token) => {
              // Fallback logo URL
              const fallbackLogo = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
              
              return (
                <div key={token.id} className="bg-[#243447] rounded-lg p-2 hover:bg-[#1b2839] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Logo */}
                      <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={token.logoURI || fallbackLogo} 
                          alt={token.mintSymbol} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackLogo;
                          }}
                        />
                      </div>
                      
                      {/* Token info */}
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-semibold text-white mr-1">${token.mintSymbol}</span>
                          <span className="text-xs text-gray-400">{truncateName(token.name)}</span>
                        </div>
                        <div className="flex items-center text-[10px] text-gray-500">
                          <span>{truncateMint(token.id)}</span>
                          <button 
                            onClick={() => copyToClipboard(token.id)}
                            className="ml-1 text-gray-400 hover:text-[#c8ec64] transition-colors"
                            title="Copy mint address"
                          >
                            {copiedMint === token.id ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Cap and Remove button */}
                    <div className="flex items-center space-x-2">
                      <div className="text-white text-xs">
                        <span className="text-gray-400 mr-1">MC:</span>
                        <span className="font-medium">{formatMarketCap(token.marketCap)}</span>
                      </div>
                      <button
                        onClick={() => removeToken(token.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove token"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-[#243447] rounded-lg shadow p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">
            Your watchlist is empty
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-6 h-6 bg-[#c8ec64] text-[#1b2839] rounded-full hover:bg-opacity-80 transition-colors text-xs font-bold mx-auto flex items-center justify-center"
            >
              +
            </button>
          )}
        </div>
      )}
      
      {watchlist.length > 0 && tokenPrices.length === 0 && !isLoading && (
        <div className="mt-4 bg-yellow-900 border border-yellow-700 text-yellow-100 px-3 py-2 rounded text-xs">
          <p className="font-bold">Warning</p>
          <p>Could not find price information for tokens in your watchlist. Please make sure you've added valid tokens.</p>
          <div className="mt-2">
            <button
              onClick={() => {
                // Clear watchlist
                setWatchlist([]);
                setTokenPrices([]);
                localStorage.removeItem('watchlist');
              }}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
            >
              Clear Watchlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 