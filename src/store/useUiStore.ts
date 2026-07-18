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

  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'next-todo-ui-storage',
    }
  )
);
