import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfileSchema, changePasswordSchema } from '../schemas/profileSchema';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  // States for notifications
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const profileForm = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
    }
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        const profileData = res.data.data;
        profileForm.reset({
          fullName: profileData.fullName || '',
          phone: profileData.phone || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileForm]);

  const onSubmitProfile = async (data) => {
    setProfileMessage(null);
    try {
      const res = await api.put('/users/profile', data);
      const updatedUser = res.data.data;
      
      // Update local storage / zustand with new name
      setUser({ ...user, fullName: updatedUser.fullName });
      
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật' });
    }
  };

  const onSubmitPassword = async (data) => {
    setPasswordMessage(null);
    try {
      await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      passwordForm.reset();
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#006CE4]" />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fa] flex-1 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hồ sơ của tôi</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-[#006CE4] flex items-center justify-center text-4xl font-bold mb-4">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg font-bold text-gray-800 text-center">{user?.fullName || 'Người dùng'}</h2>
              <p className="text-sm text-gray-500 text-center">{user?.email}</p>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#006CE4] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'password' ? 'bg-[#006CE4] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <Lock className="w-5 h-5" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 md:p-10">
            
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
                
                {profileMessage && (
                  <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profileMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể thay đổi)</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                    <input 
                      type="text" 
                      {...profileForm.register('fullName')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none transition-all"
                      placeholder="Nhập họ và tên..."
                    />
                    {profileForm.formState.errors.fullName && <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      {...profileForm.register('phone')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none transition-all"
                      placeholder="Nhập số điện thoại..."
                    />
                    {profileForm.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.phone.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={profileForm.formState.isSubmitting}
                    className="mt-4 flex items-center gap-2 bg-[#006CE4] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    {profileForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu thông tin
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
                
                {passwordMessage && (
                  <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      {...passwordForm.register('currentPassword')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none transition-all"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      {...passwordForm.register('newPassword')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none transition-all"
                      placeholder="Nhập mật khẩu mới"
                    />
                    {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      {...passwordForm.register('confirmPassword')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#006CE4] focus:border-transparent outline-none transition-all"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={passwordForm.formState.isSubmitting}
                    className="mt-4 flex items-center gap-2 bg-[#006CE4] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    {passwordForm.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
