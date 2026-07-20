import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TodoList, SpecialListSettings } from '@/types';

interface TaskState {
  lists: TodoList[];
  tasks: Task[];
  statusColors: { done: string; in_progress: string; unfinished: string };
  // Backgrounds/settings for virtual lists (all) and user lists by ID
  specialListSettings: Record<string, SpecialListSettings>;

  // List Actions
  addList: (name: string, icon?: string, color?: string) => void;
  updateList: (id: string, updates: Partial<TodoList>) => void;
  updateListSettings: (id: string, settings: Partial<Pick<TodoList, 'background' | 'bgOpacity' | 'icon' | 'description' | 'textColor'>>) => void;
  updateSpecialListSettings: (id: string, settings: Partial<SpecialListSettings>) => void;
  deleteList: (id: string) => void;
  updateStatusColors: (colors: Partial<{ done: string; in_progress: string; unfinished: string }>) => void;

  // Task Actions
  addTask: (listId: string, title: string, parentId?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: 'done' | 'in_progress' | 'unfinished') => void;
  toggleTaskImportance: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  moveTask: (taskId: string, newListId: string) => void;
  
  // Sync Actions
  syncWithBackend: () => Promise<void>;
  setFromBackend: (data: { lists: TodoList[], tasks: Task[] }) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      lists: [],
      tasks: [],
      specialListSettings: {},
      statusColors: {
        done: '#16a34a',
        in_progress: '#2563eb',
        unfinished: '#dc2626',
      },

      addList: (name, icon, color) => {
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: crypto.randomUUID(),
              name,
              icon,
              color,
              bgOpacity: 1,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        get().syncWithBackend();
      },

      updateList: (id, updates) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...updates } : list
          ),
        }));
        get().syncWithBackend();
      },

      updateListSettings: (id, settings) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id ? { ...list, ...settings } : list
          ),
        }));
        get().syncWithBackend();
      },

      updateSpecialListSettings: (id, settings) => set((state) => ({
        specialListSettings: {
          ...state.specialListSettings,
          [id]: { ...state.specialListSettings[id], ...settings },
        },
      })),

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
          tasks: state.tasks.filter((task) => task.listId !== id),
        }));
        get().syncWithBackend();
        
        // Explicit backend delete
        const { session } = require('@/lib/useAuthStore').useAuthStore.getState();
        if (session) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          fetch(`${API_URL}/sync/list/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          }).catch(console.error);
        }
      },

      updateStatusColors: (colors) => set((state) => ({
        statusColors: { ...state.statusColors, ...colors },
      })),

      addTask: (listId, title, parentId) => {
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              listId,
              parentId,
              title,
              status: 'unfinished',
              isImportant: false,
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        }));
        get().syncWithBackend();
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
        get().syncWithBackend();
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id && task.parentId !== id),
        }));
        get().syncWithBackend();
        
        // Explicit backend delete
        const { session } = require('@/lib/useAuthStore').useAuthStore.getState();
        if (session) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          fetch(`${API_URL}/sync/task/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          }).catch(console.error);
        }
      },

      updateTaskStatus: (id, status) => {
        set((state) => {
          const isDone = status === 'done';
          return {
            tasks: state.tasks.map((task) => {
              if (task.id === id) {
                return { ...task, status, completed: isDone };
              }
              if (isDone && task.parentId === id) {
                return { ...task, status: 'done', completed: true };
              }
              return task;
            }),
          };
        });
        get().syncWithBackend();
      },

      toggleTaskImportance: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, isImportant: !task.isImportant } : task
          ),
        }));
        get().syncWithBackend();
      },

      reorderTasks: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
          const newIndex = state.tasks.findIndex((t) => t.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const newTasks = [...state.tasks];
            const [removed] = newTasks.splice(oldIndex, 1);
            newTasks.splice(newIndex, 0, removed);
            return { tasks: newTasks };
          }
          return state;
        });
        get().syncWithBackend();
      },

      moveTask: (taskId, newListId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId || task.parentId === taskId ? { ...task, listId: newListId } : task
          ),
        }));
        get().syncWithBackend();
      },

      setFromBackend: (data) => set(() => ({
        lists: data.lists.map((l: any) => ({
          id: l.id,
          name: l.name,
          icon: l.icon || undefined,
          color: l.text_color || undefined,
          bgOpacity: l.bg_opacity || 1,
          createdAt: l.created_at
        })),
        tasks: data.tasks.map((t: any) => {
          let parsedNotes = t.notes || '';
          let parentId = undefined;
          try {
            if (t.notes && t.notes.startsWith('{"text":')) {
              const parsed = JSON.parse(t.notes);
              parsedNotes = parsed.text;
              parentId = parsed.parentId;
            }
          } catch (e) {
            // keep defaults
          }
          return {
            id: t.id,
            listId: t.list_id,
            parentId: parentId,
            title: t.title,
            status: t.status,
            completed: t.status === 'done',
            isImportant: t.important,
            createdAt: t.created_at,
            notes: parsedNotes
          };
        })
      })),

      syncWithBackend: async () => {
        // Debounce logic could go here, but for simplicity we fire and forget
        const { session } = require('@/lib/useAuthStore').useAuthStore.getState();
        if (!session) return; // Only sync if logged in

        const state = get();
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const res = await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              lists: state.lists.map(l => ({
                id: l.id,
                name: l.name,
                icon: l.icon,
                bg_opacity: l.bgOpacity,
                text_color: l.color,
                created_at: l.createdAt
              })),
              tasks: state.tasks.map(t => ({
                id: t.id,
                list_id: t.listId,
                title: t.title,
                notes: JSON.stringify({ text: t.notes || '', parentId: t.parentId }),
                status: t.status,
                important: t.isImportant,
                created_at: t.createdAt
              }))
            })
          });
          if (!res.ok) console.error('Failed to sync with backend');
        } catch (e) {
          console.error('Error syncing:', e);
        }
      }
    }),
    {
      name: 'next-todo-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Remove default My Day and Important lists
          if (persistedState.lists) {
            persistedState.lists = persistedState.lists.filter(
              (l: any) => l.id !== 'default-1' && l.id !== 'default-2' && l.id !== 'default-3'
            );
          }
          // Remove tasks that belonged to deleted default lists
          if (persistedState.tasks) {
            persistedState.tasks = persistedState.tasks.filter(
              (t: any) => t.listId !== 'default-1' && t.listId !== 'default-2' && t.listId !== 'default-3'
            );
            // Normalise task status
            persistedState.tasks = persistedState.tasks.map((task: any) => ({
              ...task,
              status: task.status || (task.completed ? 'done' : 'unfinished'),
            }));
          }
          if (!persistedState.statusColors) {
            persistedState.statusColors = { done: '#16a34a', in_progress: '#2563eb', unfinished: '#dc2626' };
          }
          if (!persistedState.specialListSettings) {
            persistedState.specialListSettings = {};
          }
        }
        return persistedState;
      },
    }
  )
);
