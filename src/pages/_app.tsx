import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function App({ Component, pageProps }: AppProps) {
  const { checkAuth } = useAuthStore();
  
  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#2a3a4f',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#c8ec64',
              secondary: '#1b2839',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1b2839',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}
