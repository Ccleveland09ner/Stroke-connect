import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import type { User, RegisterData } from '../types/auth';

type Role = 'neurologist' | 'technician' | 'patient' | null;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role;
  login: (name: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      login: async (name: string, password: string) => {
        try {
          const res = await authApi.login(name, password);
          if (res.success && res.user) {
            set({
              user: res.user,
              token: res.token || 'mock-jwt-token',
              isAuthenticated: true,
              role: res.user.role as Role,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      register: async (data: RegisterData) => {
        try {
          const res = await authApi.register(data);
          if (res.success && res.userId) {
            const loginRes = await authApi.login(data.name, data.password);
            if (loginRes.success && loginRes.user) {
              set({
                user: loginRes.user,
                token: loginRes.token || 'mock-jwt-token',
                isAuthenticated: true,
                role: loginRes.user.role as Role,
              });
              return true;
            }
          }
          return false;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
        });
      },
    }),
    { name: 'stroke-app-auth' }
  )
);
