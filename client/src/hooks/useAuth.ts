import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  isActive: boolean;
}

interface AuthState {
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (employee: Employee) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      employee: null,
      isAuthenticated: false,
      login: (employee) => set({ employee, isAuthenticated: true }),
      logout: () => set({ employee: null, isAuthenticated: false }),
    }),
    {
      name: 'dental-auth',
    }
  )
);