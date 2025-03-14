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
    const { ids } = req.query;

    // ids parametresi zorunlu
    if (!ids) {
      return res.status(400).json({ message: 'Missing required parameter: ids' });
    }

    // Jupiter API'ye istek gönder
    const apiUrl = 'https://api.jup.ag/price/v2';
    console.log(`Jupiter API isteği: ${apiUrl}?ids=${ids}`);
    
    const response = await axios.get(apiUrl, {
      params: {
        ids: ids
      },
      timeout: 10000 // 10 saniye timeout
    });

    // API yanıtını döndür
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Jupiter API hatası:', error);
    
    // Hata detaylarını logla
    if (axios.isAxiosError(error)) {
      console.error('API yanıt detayları:', error.response?.data);
      console.error('API yanıt durumu:', error.response?.status);
      
      // API'den gelen hata mesajını ve durum kodunu döndür
      if (error.response) {
        return res.status(error.response.status).json({
          message: 'Jupiter API hatası',
          error: error.response.data
        });
      }
    }
    
    // Genel hata durumu
    return res.status(500).json({ 
      message: 'Jupiter API ile iletişim kurulurken bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
} 