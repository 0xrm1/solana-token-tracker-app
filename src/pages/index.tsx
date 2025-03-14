import { Watchlist } from '@/components/Watchlist';
import { BuySellModule } from '@/components/BuySellModule';
import { Geist } from 'next/font/google';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProtectedContent } from '@/components/ProtectedContent';
import { useAuthStore } from '@/lib/auth-store';

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
});

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { checkAuth } = useAuthStore();
  
  // Check authentication status on page load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Clear localStorage when page loads (only during development)
  useEffect(() => {
    // Uncomment to clear watchlist during development
    // localStorage.removeItem('watchlist');
  }, []);
  
  return (
    <div className={`${geistSans.className} min-h-screen bg-[#1b2839] text-white`}>
      {/* Navigation */}
      <Navbar />
      
      <main className="px-4 max-w-[95%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Left Column - Modules (30%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Row - Module 1 and 2 side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Module 1 */}
              <div className="bg-[#2a3a4f] border border-gray-700 rounded-lg aspect-square flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-lg font-semibold text-[#c8ec64]">Module 1</h3>
                  <p className="text-sm text-gray-300 mt-2">Coming soon</p>
                </div>
              </div>
              
              {/* Module 2 */}
              <div className="bg-[#2a3a4f] border border-gray-700 rounded-lg aspect-square flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-lg font-semibold text-[#c8ec64]">Module 2</h3>
                  <p className="text-sm text-gray-300 mt-2">Coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Bottom Row - Module 3 horizontal */}
            <div className="bg-[#2a3a4f] border border-gray-700 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center p-4 w-full">
                <h3 className="text-lg font-semibold text-[#c8ec64]">Module 3</h3>
                <p className="text-sm text-gray-300 mt-2">Coming soon</p>
                <div className="mt-4 p-3 bg-[#1b2839] rounded-lg">
                  <ul className="text-left space-y-2 text-xs">
                    <li className="flex items-center">
                      <span className="mr-2 text-[#c8ec64]">•</span>
                      <span>Advanced token analytics</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-[#c8ec64]">•</span>
                      <span>Price alerts</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-[#c8ec64]">•</span>
                      <span>Portfolio tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Module 4 (70%) */}
          <div className="lg:col-span-7 bg-[#2a3a4f] border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-white">Module 4</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
              {/* Module 5 - Watchlist (30% of Module 4) */}
              <div className="lg:col-span-3 bg-[#243447] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-[#c8ec64]">Watchlist (Module 5)</h3>
                <ProtectedContent onLoginClick={() => setIsLoginModalOpen(true)}>
                  <Watchlist />
                </ProtectedContent>
              </div>
              
              {/* Module 6 - Buy-Sell (70% of Module 4) */}
              <div className="lg:col-span-7 bg-[#243447] border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-[#c8ec64]">Buy-Sell (Module 6)</h3>
                <ProtectedContent onLoginClick={() => setIsLoginModalOpen(true)}>
                  <BuySellModule />
                </ProtectedContent>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-[#1b2839] mt-8 max-w-[95%] mx-auto">
        <div className="py-4 px-4 text-center text-xs text-gray-400">
          <p>Built using Jupiter API</p>
        </div>
      </footer>
    </div>
  );
}
