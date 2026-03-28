import { create } from 'zustand';

export const usePantryStore = create((set) => ({
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'expiry', // 'expiry', 'name', 'category', 'date_added'
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSortBy: (sort) => set({ sortBy: sort }),
}));
