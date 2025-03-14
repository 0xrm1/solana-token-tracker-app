import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className={cn(
      "p-3 bg-red-500/20 border border-red-500 rounded-md",
      className
    )}>
      <p className="text-sm text-red-500">{message}</p>
    </div>
  );
}

export default ErrorMessage; 