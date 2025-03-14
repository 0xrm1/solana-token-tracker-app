import axios from 'axios';

// Token bilgileri
export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  supply?: number; // Token'ın toplam arzı
}

// Fiyat bilgileri
export interface TokenPrice {
  id: string;
  mintSymbol: string;
  name: string;
  price: number;
  priceChange24h?: number;
  logoURI?: string;
  marketCap?: number; // Token'ın piyasa değeri
}

// USDC mint adresi (fiyat karşılaştırması için)
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Token bilgilerini önbelleğe alma
const tokenInfoCache: Record<string, Token> = {};

/**
 * Jupiter API'sinden token bilgilerini alır
 */
export async function getTokenInfo(): Promise<Record<string, Token>> {
  try {
    // API'den token bilgilerini getir
    const response = await axios.get('/api/jupiter-tokens');
    
    if (response.data && Array.isArray(response.data)) {
      // Token bilgilerini işle
      response.data.forEach((token: Token) => {
        const mintAddress = token.address;
        
        if (mintAddress) {
          // Önbelleğe ekle
          tokenInfoCache[mintAddress] = token;
          
          console.log(`Token bilgisi eklendi: ${token.symbol} (${mintAddress})`);
        }
      });
    }
    
    return tokenInfoCache;
  } catch (error) {
    console.error('Token bilgileri getirme hatası:', error);
    return tokenInfoCache;
  }
}

/**
 * Belirli bir token'ın bilgilerini alır
 */
export async function getTokenInfoByMint(mint: string): Promise<Token | null> {
  try {
    // Önbellekte varsa, oradan döndür
    if (tokenInfoCache[mint]) {
      return tokenInfoCache[mint];
    }

    // API'den token bilgisini al
    const response = await axios.get(`/api/jupiter-tokens?mint=${mint}`);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const token = response.data[0];
      
      // Tüm tokenlar için varsayılan supply değeri
      const supply = 1_000_000_000; // Varsayılan olarak 1 milyar
      
      // Token bilgisini önbelleğe ekle
      const tokenInfo: Token = {
        address: token.address || token.mint,
        chainId: token.chainId || 101,
        decimals: token.decimals || 0,
        name: token.name || 'Unknown Token',
        symbol: token.symbol || 'Unknown',
        logoURI: token.logoURI,
        tags: token.tags,
        supply: supply
      };
      
      // Önbelleğe ekle
      tokenInfoCache[mint] = tokenInfo;
      
      console.log(`Token bilgisi alındı: ${tokenInfo.symbol} (${mint})`);
      return tokenInfo;
    }
    
    return null;
  } catch (error) {
    console.error('Token bilgisi getirme hatası:', error);
    return null;
  }
}

/**
 * Jupiter API'sinden token fiyatlarını alır
 * @param mints Token mint adresleri listesi
 */
export async function getTokenPrices(mints: string[]): Promise<TokenPrice[]> {
  try {
    if (!mints || mints.length === 0) {
      return [];
    }

    // Her mint için token bilgilerini getir
    const tokenInfoPromises = mints.map(mint => getTokenInfoByMint(mint));
    const tokenInfoResults = await Promise.all(tokenInfoPromises);
    
    // Geçerli token bilgisi olan mint'leri filtrele
    const validMints = mints.filter((mint, index) => tokenInfoResults[index] !== null);
    
    if (validMints.length === 0) {
      console.warn('Geçerli token bilgisi bulunamadı');
      return [];
    }

    // API'ye istek gönder
    const response = await axios.get(`/api/jupiter-price?ids=${validMints.join(',')}`);
    console.log('Jupiter API yanıtı:', response.data);

    // Sonuçları işle
    const result: TokenPrice[] = [];
    
    for (const mint of validMints) {
      const tokenInfo = tokenInfoCache[mint];
      const priceData = response.data.data?.[mint];
      
      // Eğer token bilgisi ve fiyat verisi varsa, sonuca ekle
      if (tokenInfo && priceData) {
        // Fiyat verisini sayıya dönüştür
        const price = typeof priceData.price === 'string' 
          ? parseFloat(priceData.price) 
          : (typeof priceData.price === 'number' ? priceData.price : 0);
        
        // Fiyat değişimini sayıya dönüştür
        const priceChange24h = priceData.price_24h_change !== undefined
          ? (typeof priceData.price_24h_change === 'string'
              ? parseFloat(priceData.price_24h_change)
              : (typeof priceData.price_24h_change === 'number' 
                  ? priceData.price_24h_change 
                  : undefined))
          : undefined;
        
        // Marketcap hesapla (fiyat * toplam arz)
        const marketCap = tokenInfo.supply ? price * tokenInfo.supply : undefined;
        
        result.push({
          id: mint,
          mintSymbol: tokenInfo.symbol,
          name: tokenInfo.name,
          price: price,
          priceChange24h: priceChange24h,
          logoURI: tokenInfo.logoURI,
          marketCap: marketCap
        });
        
        console.log(`Token fiyatı eklendi: ${tokenInfo.symbol} - $${price} - MarketCap: $${marketCap?.toLocaleString()}`);
      } else {
        console.warn(`${mint} için fiyat verisi bulunamadı`);
      }
    }

    return result;
  } catch (error) {
    console.error('Fiyat getirme hatası:', error);
    return [];
  }
} 