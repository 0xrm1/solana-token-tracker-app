import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuthStore } from '@/lib/auth-store';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, isLoading, error, clearError } = useAuthStore();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear previous errors
    setErrors({});
    clearError();
    
    try {
      // Attempt login
      await login({ username, password });
      
      // Close modal on success
      onClose();
      
      // Reset form
      setUsername('');
      setPassword('');
    } catch (error) {
      // Error is handled by the auth store
      console.error('Login error:', error);
    }
  };

  // Switch to register modal
  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRegisterClick();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Show general error message if any */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        
        {/* Username field */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-white">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            error={errors.username}
          />
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-white">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            error={errors.password}
          />
        </div>
        
        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-[#c8ec64] text-[#1b2839] hover:bg-[#c8ec64]/90"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        
        {/* Register link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={handleRegisterClick}
              className="text-[#c8ec64] hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default LoginModal; 