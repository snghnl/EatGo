// hooks/useSearchStore.ts
import { create } from 'zustand';

interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    distance: number;
}

interface SearchState {
    keyword: string;
    setKeyword: (text: string) => void;
    allItems: Place[];
    setAllItems: (items: Place[]) => void;
    getResults: () => Place[];
}

export const useSearchStore = create<SearchState>((set, get) => ({
    keyword: '',
    setKeyword: (text) => set({ keyword: text }),
    allItems: [], // 전체 장소 목록
    setAllItems: (items) => set({ allItems: items }),
    getResults: () => {
        const { keyword, allItems } = get();
        if (!keyword) return [];
        return allItems.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
    },
}));
