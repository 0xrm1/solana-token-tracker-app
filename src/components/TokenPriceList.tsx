import React, { useState, useEffect } from 'react';
import { TokenPrice, getTokenPrices } from '@/lib/jupiter-api';
import { TokenPriceCard } from './TokenPriceCard';

export function TokenPriceList() {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  
  // Fiyatları periyodik olarak güncelle
  useEffect(() => {
    // İlk yükleme
    fetchPrices();
    
    // 30 saniyede bir güncelle
    const intervalId = setInterval(() => {
      fetchPrices();
    }, 30000);
    
    // Temizleme fonksiyonu
    return () => clearInterval(intervalId);
  }, []);
  
  // Fiyatları getir
  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      // Watchlist boş olarak başlayacağı için burada örnek token göstermiyoruz
      setTokenPrices([]);
      setLastUpdateTime(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Fiyat getirme hatası:', err);
      setError('Fiyatlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Yükleme durumunda placeholder kartlar göster
  const renderLoadingState = () => {
    // Yükleme durumunda boş bir dizi döndür
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        Yükleniyor...
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Token Fiyatları</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? renderLoadingState()
          : tokenPrices.length > 0 
            ? tokenPrices.map((tokenPrice) => (
                <TokenPriceCard key={tokenPrice.id} tokenPrice={tokenPrice} />
              ))
            : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Henüz token eklenmemiş. Watchlist'e token ekleyerek başlayabilirsiniz.
              </div>
            )}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        {lastUpdateTime && (
          <p>Son güncelleme: {lastUpdateTime}</p>
        )}
        <button
          onClick={() => fetchPrices()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Yenile
        </button>
      </div>
    </div>
  );
} 