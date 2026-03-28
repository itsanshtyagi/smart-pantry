import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: undefined, // undefined = loading, null = not logged in
    setUser: (user) => set({ user }),
}));
