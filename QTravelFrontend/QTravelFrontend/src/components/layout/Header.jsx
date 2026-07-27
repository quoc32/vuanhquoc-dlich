import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Plane, User, LogOut, Settings } from 'lucide-react';
import SettingsModal from '../ui/SettingsModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl">
          <Plane className="w-8 h-8" />
          <span>QTravel</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <Link to="/" className="hover:text-primary transition-colors">Flights</Link>
          <Link to="/hotels" className="hover:text-primary transition-colors">Hotels</Link>
          <Link to="#" className="hover:text-primary transition-colors">Offers</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 text-sm font-medium hover:bg-gray-50 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#006CE4] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline text-gray-700">{user?.fullName || 'User'}</span>
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      Hồ sơ của tôi
                    </Link>
                    
                    <Link 
                      to="/my-bookings" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Plane className="w-4 h-4 text-gray-500" />
                      Chuyến bay của tôi
                    </Link>

                    <button 
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      Cài đặt hiển thị
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary font-medium">Log in</Link>
              <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Sign up</Link>
            </>
          )}
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;
