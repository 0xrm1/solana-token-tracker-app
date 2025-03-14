import apiClient from './api-client';

// Wallet interface
export interface Wallet {
  id: string;
  userId: string;
  name: string;
  address: string;
  encryptedPrivateKey: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet balance interface
export interface WalletBalance {
  balance: number;
  address: string;
}

// Create wallet data interface
export interface CreateWalletData {
  name: string;
}

// Update wallet data interface
export interface UpdateWalletData {
  name: string;
}

/**
 * Wallet Service
 * Handles all wallet-related API calls
 */
class WalletService {
  /**
   * Get all wallets for the authenticated user
   */
  async getWallets(): Promise<Wallet[]> {
    try {
      return await apiClient.get<Wallet[]>('/wallets');
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  /**
   * Get a specific wallet by ID
   */
  async getWallet(id: string): Promise<Wallet> {
    try {
      return await apiClient.get<Wallet>(`/wallets/${id}`);
    } catch (error) {
      console.error(`Error fetching wallet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new wallet
   */
  async createWallet(data: CreateWalletData): Promise<Wallet> {
    try {
      return await apiClient.post<Wallet>('/wallets', data);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Update a wallet
   */
  async updateWallet(id: string, data: UpdateWalletData): Promise<Wallet> {
    try {
      return await apiClient.patch<Wallet>(`/wallets/${id}`, data);
    } catch (error) {
      console.error(`Error updating wallet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a wallet
   */
  async deleteWallet(id: string): Promise<void> {
    try {
      await apiClient.delete(`/wallets/${id}`);
    } catch (error) {
      console.error(`Error deleting wallet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(id: string): Promise<WalletBalance> {
    try {
      return await apiClient.get<WalletBalance>(`/wallets/${id}/balance`);
    } catch (error) {
      console.error(`Error fetching balance for wallet ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const walletService = new WalletService();

// Export default for convenience
export default walletService; 