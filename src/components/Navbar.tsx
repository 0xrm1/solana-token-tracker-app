import React, { useState } from 'react';
import { Button } from './ui/button';
import { useAuthStore } from '@/lib/auth-store';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Open login modal
  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };
  
  // Open register modal
  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };
  
  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <nav className="w-full h-16 border border-gray-700 rounded-lg mb-4 mx-auto mt-4 max-w-[95%] bg-[#2a3a4f]">
        <div className="h-full flex items-center justify-between px-4">
          {/* Logo/Title */}
          <div>
            <h1 className="text-xl font-bold text-white">Solana Token Tracker</h1>
          </div>
          
          {/* Auth Buttons or User Profile */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#1b2839]/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#c8ec64] flex items-center justify-center text-[#1b2839] font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white">{user?.username}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2a3a4f] border border-gray-700 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-white hover:bg-[#1b2839]/50"
                      >
                        Profile
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-white hover:bg-[#1b2839]/50"
                      >
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1b2839]/50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-[#1b2839]/50"
                  onClick={openLoginModal}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#c8ec64] text-[#1b2839] hover:bg-[#c8ec64]/90"
                  onClick={openRegisterModal}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={openRegisterModal}
      />
      
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={openLoginModal}
      />
    </>
  );
}

export default Navbar; 