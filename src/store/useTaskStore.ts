import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TodoList } from '@/types';

interface TaskState {
  lists: TodoList[];
  tasks: Task[];
  statusColors: { done: string; in_progress: string; unfinished: string };
  // Backgrounds for virtual lists (all, default-1, default-2, etc.)
  specialListSettings: Record<string, { background?: string; bgOpacity?: number }>;
  
  // List Actions
  addList: (name: string, icon?: string, color?: string) => void;
  updateList: (id: string, updates: Partial<TodoList>) => void;
  updateListSettings: (id: string, settings: { background?: string, bgOpacity?: number, icon?: string }) => void;
  updateSpecialListSettings: (id: string, settings: { background?: string; bgOpacity?: number }) => void;
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
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      lists: [
        { id: 'default-1', name: 'My Day', icon: '☀️', createdAt: new Date().toISOString() },
        { id: 'default-2', name: 'Important', icon: '⭐', createdAt: new Date().toISOString() }
      ],
      tasks: [],
      specialListSettings: {},
      statusColors: {
        done: '#16a34a',
        in_progress: '#2563eb',
        unfinished: '#dc2626'
      },

      addList: (name, icon, color) => set((state) => ({
        lists: [
          ...state.lists,
          {
            id: crypto.randomUUID(),
            name,
            icon,
            color,
            bgOpacity: 0.5,
            createdAt: new Date().toISOString()
          }
        ]
      })),

      updateList: (id, updates) => set((state) => ({
        lists: state.lists.map((list) => 
          list.id === id ? { ...list, ...updates } : list
        )
      })),

      updateListSettings: (id, settings) => set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? { ...list, ...settings } : list
        )
      })),

      updateSpecialListSettings: (id, settings) => set((state) => ({
        specialListSettings: {
          ...state.specialListSettings,
          [id]: { ...state.specialListSettings[id], ...settings }
        }
      })),

      deleteList: (id) => set((state) => ({
        lists: state.lists.filter((list) => list.id !== id),
        tasks: state.tasks.filter((task) => task.listId !== id)
      })),

      updateStatusColors: (colors) => set((state) => ({
        statusColors: { ...state.statusColors, ...colors }
      })),

      addTask: (listId, title, parentId) => set((state) => ({
        tasks: [
          {
            id: crypto.randomUUID(),
            listId,
            parentId,
            title,
            status: 'unfinished',
            isImportant: listId === 'default-2',
            createdAt: new Date().toISOString()
          },
          ...state.tasks
        ]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id && task.parentId !== id)
      })),

      updateTaskStatus: (id, status) => set((state) => {
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
          })
        };
      }),

      toggleTaskImportance: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, isImportant: !task.isImportant } : task
        )
      })),

      reorderTasks: (activeId, overId) => set((state) => {
        const oldIndex = state.tasks.findIndex((t) => t.id === activeId);
        const newIndex = state.tasks.findIndex((t) => t.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newTasks = [...state.tasks];
          const [removed] = newTasks.splice(oldIndex, 1);
          newTasks.splice(newIndex, 0, removed);
          return { tasks: newTasks };
        }
        return state;
      }),

      moveTask: (taskId, newListId) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId || task.parentId === taskId ? { ...task, listId: newListId } : task
        )
      }))
    }),
    {
      name: 'next-todo-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          if (persistedState.tasks) {
            const newTasks: any[] = [];
            persistedState.tasks.forEach((task: any) => {
              if (task.steps && task.steps.length > 0) {
                task.steps.forEach((step: any) => {
                  newTasks.push({
                    id: step.id,
                    listId: task.listId,
                    parentId: task.id,
                    title: step.title,
                    status: step.isCompleted ? 'done' : 'unfinished',
                    isImportant: false,
                    createdAt: task.createdAt
                  });
                });
                delete task.steps;
              }
              newTasks.push({
                ...task,
                status: task.status || (task.completed ? 'done' : 'unfinished')
              });
            });
            persistedState.tasks = newTasks;
          }
          if (persistedState.lists) {
            persistedState.lists = persistedState.lists.filter((l: any) => l.id !== 'default-3');
          }
          if (!persistedState.statusColors) {
            persistedState.statusColors = { done: '#22c55e', in_progress: '#3b82f6', unfinished: '#ef4444' };
          }
        }
        return persistedState;
      }
    }
  )
);
