export interface Step {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  notes?: string;
  completed: boolean;
  isImportant: boolean;
  dueDate?: string | null;
  icon?: string;
  steps: Step[];
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
