import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
    }),
    {
      name: 'app-storage', // key in localStorage
    }
  )
);