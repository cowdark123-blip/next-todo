import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  
  activeTaskId: string | null;
  setActiveTask: (id: string | null) => void;

  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;

  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;

  isPipMode: boolean;
  setPipMode: (isPip: boolean) => void;

  listSortBy: 'manual' | 'name' | 'date';
  setListSortBy: (sortBy: 'manual' | 'name' | 'date') => void;
  listSortOrder: 'asc' | 'desc';
  setListSortOrder: (order: 'asc' | 'desc') => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  isFocusMode: false,
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  
  activeTaskId: null,
  setActiveTask: (id) => set({ activeTaskId: id }),

  language: 'vi',
  setLanguage: (lang) => set({ language: lang }),
  
  sidebarWidth: 256,
  setSidebarWidth: (width) => set({ sidebarWidth: width }),

  isPipMode: false,
  setPipMode: (isPip) => set({ isPipMode: isPip }),

  listSortBy: 'manual',
  setListSortBy: (sortBy) => set({ listSortBy: sortBy }),
  
  listSortOrder: 'asc',
  setListSortOrder: (order) => set({ listSortOrder: order }),
    }),
    {
      name: 'next-todo-ui-storage',
      partialize: (state) => 
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['isPipMode'].includes(key))
        ) as UiState,
    }
  )
);
