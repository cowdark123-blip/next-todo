export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  subTasks: SubTask[];
  createdAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}
