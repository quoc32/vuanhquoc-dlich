import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (userData, accessToken, refreshToken) => {
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user: userData, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },
      
      setUser: (userData) => set({ user: userData, isAuthenticated: !!userData }),
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
