import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Plane, User, LogOut, Settings, Briefcase, Bell, CheckCircle } from 'lucide-react';
import SettingsModal from '../ui/SettingsModal';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { format } from 'date-fns';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch initial history
      api.get('/notifications').then(res => {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }).catch(err => console.error('Error fetching notifs:', err));

      const token = localStorage.getItem('token');
      // Connect socket
      socketRef.current = io('http://localhost:3000', {
        auth: { token }
      });

      socketRef.current.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
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
            <div className="flex items-center gap-4">
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsMenuOpen(false);
                    if (!isNotifOpen && unreadCount > 0) {
                      handleMarkAsRead();
                    }
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden flex flex-col max-h-[400px]">
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAsRead} className="text-xs text-[#006CE4] hover:underline font-medium">
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 text-gray-300" />
                            Chưa có thông báo nào
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex gap-3">
                                <div className="mt-0.5">
                                  {notif.type === 'HOTEL_BOOKING' ? <Briefcase className="w-5 h-5 text-[#006CE4]" /> : <Plane className="w-5 h-5 text-green-500" />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-800">{notif.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                                    {format(new Date(notif.createdAt), 'dd/MM/yyyy HH:mm')}
                                  </span>
                                </div>
                                {!notif.isRead && <div className="w-2 h-2 bg-[#006CE4] rounded-full mt-1 flex-shrink-0"></div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setIsNotifOpen(false);
                  }}
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
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        Quản lý Đặt chỗ
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
