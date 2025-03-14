import React from 'react';
import { TokenPrice } from '@/lib/jupiter-api';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TokenPriceCardProps {
  tokenPrice: TokenPrice;
  isLoading?: boolean;
}

export function TokenPriceCard({ tokenPrice, isLoading = false }: TokenPriceCardProps) {
  // Fiyat değişiminin pozitif, negatif veya nötr olduğunu belirle
  const priceChangeDirection = 
    !tokenPrice.priceChange24h ? 'neutral' :
    tokenPrice.priceChange24h > 0 ? 'positive' : 
    tokenPrice.priceChange24h < 0 ? 'negative' : 'neutral';
  
  // Fiyat değişimi için stil sınıfları
  const priceChangeClasses = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  };
  
  // Fiyat değişimi için ok ikonu
  const priceChangeIcon = {
    positive: '↑',
    negative: '↓',
    neutral: ''
  };
  
  // Fiyat değişimini yüzde olarak formatla
  const formatPriceChange = (change?: number) => {
    if (!change) return '0.00%';
    const absChange = Math.abs(change);
    return `${absChange.toFixed(2)}%`;
  };
  
  // Fiyatı formatla (USDC)
  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };
  
  // Fallback logo URL
  const fallbackLogo = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full max-w-sm">
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              {tokenPrice.logoURI ? (
                <div className="w-8 h-8 mr-2 rounded-full overflow-hidden">
                  <img 
                    src={tokenPrice.logoURI || fallbackLogo} 
                    alt={tokenPrice.mintSymbol} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Logo yüklenemezse fallback logo kullan
                      (e.target as HTMLImageElement).src = fallbackLogo;
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 mr-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{tokenPrice.mintSymbol.substring(0, 2)}</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{tokenPrice.mintSymbol}</h3>
                <p className="text-xs text-gray-500">{tokenPrice.name}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">vs {tokenPrice.vsTokenSymbol}</span>
          </div>
          
          <div className="text-2xl font-bold mb-2">
            {formatPrice(tokenPrice.price)}
          </div>
          
          {/* Jupiter API v2'de priceChange24h olmayabilir */}
          {tokenPrice.priceChange24h !== undefined ? (
            <div className={cn("text-sm font-medium flex items-center", priceChangeClasses[priceChangeDirection])}>
              {priceChangeIcon[priceChangeDirection]} {formatPriceChange(tokenPrice.priceChange24h)}
              <span className="text-xs text-gray-500 ml-2">24s değişim</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Fiyat değişimi bilgisi mevcut değil
            </div>
          )}
        </>
      )}
    </div>
  );
} 