import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff' | 'tutor' | 'student';
  role_display: string;
  phone?: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => void;
  hasRole: (role: User['role']) => boolean;
  canAccessAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isStaff: () => boolean;
  initializeAuth: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: () => {
    console.log('🔄 initializeAuth called');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('📦 LocalStorage data:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('✅ Auth initialized successfully:', { user: user.name, role: user.role });
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      console.log('❌ No auth data in localStorage');
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/login', { email, password });
      const { user, token, success } = response.data;
      
      if (success) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        return { success: true };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const { user } = get();
    return user ? user.role === role : false;
  },

  canAccessAdmin: () => {
    const { user } = get();
    return user ? (user.role === 'admin' || user.role === 'super_admin') : false;
  },

  isSuperAdmin: () => {
    const { user } = get();
    return user ? user.role === 'super_admin' : false;
  },

  isStaff: () => {
    const { user } = get();
    return user ? user.role === 'staff' : false;
  }
}));