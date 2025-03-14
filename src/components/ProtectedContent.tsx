import React, { ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from './ui/button';

interface ProtectedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onLoginClick: () => void;
  showFallbackOnly?: boolean;
}

export function ProtectedContent({
  children,
  fallback,
  onLoginClick,
  showFallbackOnly = false,
}: ProtectedContentProps) {
  const { isAuthenticated } = useAuthStore();

  // If user is authenticated, show the content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If showFallbackOnly is true, only show the fallback content
  if (showFallbackOnly && fallback) {
    return <>{fallback}</>;
  }

  // Default fallback with login prompt
  return (
    <div className="relative">
      {/* Show content with blur effect */}
      <div className="filter blur-sm pointer-events-none opacity-70">
        {children}
      </div>

      {/* Overlay with login prompt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg p-4 text-center">
        {fallback ? (
          fallback
        ) : (
          <>
            <h3 className="text-lg font-semibold text-white mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Please login to access this feature
            </p>
            <Button
              onClick={onLoginClick}
              className="bg-[#c8ec64] text-[#1b2839] hover:bg-[#c8ec64]/90"
            >
              Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProtectedContent; 