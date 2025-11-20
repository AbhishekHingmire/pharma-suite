import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string[]) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  
  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  
  isAuthenticated: () => {
    return get().user !== null;
  },
  
  hasRole: (roles) => {
    const user = get().user;
    return user ? roles.includes(user.role) : false;
  },
}));
