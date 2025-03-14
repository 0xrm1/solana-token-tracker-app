import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from './api-client';

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Auth store state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Login action
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call login API
          const response = await apiClient.post<{ token: string; user: User }>('/auth/login', credentials);
          
          // Set auth state
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },
      
      // Register action
      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Call register API
          const response = await apiClient.post<{ token: string; user: User }>('/users', data);
          
          // Set auth state
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },
      
      // Logout action
      logout: () => {
        // Clear auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Remove token from localStorage
        localStorage.removeItem('auth_token');
      },
      
      // Clear error
      clearError: () => {
        set({ error: null });
      },
      
      // Check authentication status
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          // Verify token by fetching user profile
          const user = await apiClient.get<User>('/users/profile');
          
          set({
            user,
            isAuthenticated: true,
          });
          
          return true;
        } catch (error) {
          // Token is invalid or expired
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          
          localStorage.removeItem('auth_token');
          return false;
        }
      },
    }),
    {
      name: 'auth-storage', // Storage key
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);

// Setup listener for unauthorized events
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore; 