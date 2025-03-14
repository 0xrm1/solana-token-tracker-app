import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

// Solana RPC bağlantısı - Daha güvenilir bir RPC kullanıyoruz
const connection = new Connection('https://nd-786-586-534.p2pify.com/7626149aa01d737ee010566b4781e64d', 'confirmed');

// LocalStorage anahtarları
const PRIVATE_KEY_STORAGE_KEY = 'solana_private_key';

// Cüzdan oluştur
export const createWallet = async (): Promise<{ publicKey: string; privateKey: string }> => {
  try {
    // Yeni bir keypair oluştur
    const keypair = Keypair.generate();
    
    // Public ve private key'leri al
    const publicKey = keypair.publicKey.toString();
    const privateKey = Buffer.from(keypair.secretKey).toString('hex');
    
    // Private key'i localStorage'a kaydet
    localStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKey);
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('Cüzdan oluşturulurken hata:', error);
    throw new Error('Cüzdan oluşturulamadı');
  }
};

// Mevcut cüzdanı getir
export const getWallet = (): { publicKey: string; privateKey: string } | null => {
  try {
    const privateKeyHex = localStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
    
    if (!privateKeyHex) {
      return null;
    }
    
    // Hex formatındaki private key'i Uint8Array'e dönüştür
    const privateKeyBytes = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    // Keypair oluştur
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: privateKeyHex
    };
  } catch (error) {
    console.error('Cüzdan bilgileri alınırken hata:', error);
    return null;
  }
};

// Cüzdan bakiyesini getir
export const getWalletBalance = async (publicKey: string): Promise<number> => {
  try {
    // Bakiyeyi sorgula (3 kez deneme yaparak)
    let balance = 0;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        balance = await connection.getBalance(new PublicKey(publicKey));
        break; // Başarılı olursa döngüden çık
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw err; // Son denemede de başarısız olursa hatayı fırlat
        }
        // Kısa bir bekleme süresi ekle
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return balance / LAMPORTS_PER_SOL; // SOL cinsinden bakiye
  } catch (error) {
    console.error('Bakiye sorgulanırken hata:', error);
    return 0;
  }
};

// Cüzdan adresini kısalt
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Cüzdanı sil
export const deleteWallet = (): void => {
  localStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
}; 