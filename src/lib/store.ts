import { create } from 'zustand';

// Uygulama durumu için tip tanımı
interface AppState {
  isLoading: boolean;
  darkMode: boolean;
  setLoading: (isLoading: boolean) => void;
  toggleDarkMode: () => void;
}

// Zustand store oluşturma
export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  darkMode: false,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

// Kullanıcı durumu için tip tanımı
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Kimlik doğrulama store'u
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user: User) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
})); 