import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Eğer mint parametresi varsa, sadece o token'ı getir
    const mintParam = req.query.mint as string;
    
    if (mintParam) {
      try {
        // Belirtilen mint adresi için token bilgisini al
        const response = await axios.get(`https://api.jup.ag/tokens/v1/token/${mintParam}`, {
          timeout: 10000
        });
        return res.status(200).json([response.data]);
      } catch (error) {
        console.error(`Token bilgisi alınamadı: ${mintParam}`, error);
        
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
          // Token bulunamadı
          return res.status(404).json({ message: 'Token bulunamadı' });
        }
        
        return res.status(500).json({ 
          message: 'Token bilgisi alınırken bir hata oluştu',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
      }
    }
    
    // Mint parametresi yoksa boş bir dizi döndür
    // Artık önceden tanımlanmış token listesi kullanmıyoruz
    return res.status(200).json([]);
  } catch (error) {
    console.error('Jupiter Tokens API hatası:', error);
    
    // Hata detaylarını logla
    if (axios.isAxiosError(error)) {
      console.error('API yanıt detayları:', error.response?.data);
      console.error('API yanıt durumu:', error.response?.status);
      
      // API'den gelen hata mesajını ve durum kodunu döndür
      if (error.response) {
        return res.status(error.response.status).json({
          message: 'Jupiter Tokens API hatası',
          error: error.response.data
        });
      }
    }
    
    // Genel hata durumu
    return res.status(500).json({ 
      message: 'Jupiter Tokens API ile iletişim kurulurken bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
} 