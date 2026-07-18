export interface Task {
  id: string;
  listId: string;
  parentId?: string; // For sub-tasks
  title: string;
  description?: string;
  notes?: string;
  status: 'done' | 'in_progress' | 'unfinished';
  completed?: boolean; // For backward compatibility migration
  isImportant: boolean;
  dueDate?: string | null;
  icon?: string;
  createdAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  background?: string;
  bgOpacity?: number;
  createdAt: string;
}
