import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: localStorage.getItem("theme") || "dark",
      setUser: (user) => set({ user }),
      toggleTheme: () =>
        set(state => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          localStorage.setItem("theme", newTheme);
          return { theme: newTheme };
        }),
    }),
    {
      name: 'app-storage',
    }
  )
);