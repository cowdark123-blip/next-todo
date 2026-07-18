import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TodoList, Step } from '@/types';

interface TaskState {
  lists: TodoList[];
  tasks: Task[];
  
  // List Actions
  addList: (name: string, icon?: string, color?: string) => void;
  updateList: (id: string, updates: Partial<TodoList>) => void;
  updateListSettings: (id: string, settings: { background?: string, bgOpacity?: number, icon?: string }) => void;
  deleteList: (id: string) => void;
  
  // Task Actions
  addTask: (listId: string, title: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleTaskImportance: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  moveTask: (taskId: string, newListId: string) => void;
  
  // Steps Actions
  addStep: (taskId: string, title: string) => void;
  toggleStep: (taskId: string, stepId: string) => void;
  deleteStep: (taskId: string, stepId: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      lists: [
        { id: 'default-1', name: 'My Day', icon: 'Sun', createdAt: new Date().toISOString() },
        { id: 'default-2', name: 'Important', icon: 'Star', createdAt: new Date().toISOString() },
        { id: 'default-3', name: 'Tasks', icon: 'Home', createdAt: new Date().toISOString() }
      ],
      tasks: [],

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

      deleteList: (id) => set((state) => ({
        lists: state.lists.filter((list) => list.id !== id),
        tasks: state.tasks.filter((task) => task.listId !== id)
      })),

      addTask: (listId, title) => set((state) => ({
        tasks: [
          {
            id: crypto.randomUUID(),
            listId,
            title,
            completed: false,
            isImportant: listId === 'default-2',
            steps: [],
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
        tasks: state.tasks.filter((task) => task.id !== id)
      })),

      toggleTaskCompletion: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      })),

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
          task.id === taskId ? { ...task, listId: newListId } : task
        )
      })),

      addStep: (taskId, title) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: [
                  ...task.steps,
                  { id: crypto.randomUUID(), title, isCompleted: false }
                ]
              }
            : task
        )
      })),

      toggleStep: (taskId, stepId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: task.steps.map((st) =>
                  st.id === stepId ? { ...st, isCompleted: !st.isCompleted } : st
                )
              }
            : task
        )
      })),

      deleteStep: (taskId, stepId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: task.steps.filter((st) => st.id !== stepId)
              }
            : task
        )
      }))
    }),
    {
      name: 'next-todo-storage',
    }
  )
);
