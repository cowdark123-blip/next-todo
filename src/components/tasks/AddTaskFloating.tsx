"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AddTaskFloatingProps {
  listId: string;
}

export function AddTaskFloating({ listId }: AddTaskFloatingProps) {
  const { addTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const t = useTranslation();

  if (listId === 'all') return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(listId, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 px-4 w-full max-w-4xl mx-auto z-30 transition-all duration-300">
      <form onSubmit={handleAddTask} className="relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center bg-background border-[3px] border-border rounded-xl overflow-hidden px-4 py-2 transition-all duration-300 focus-within:border-primary">
          <Plus className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            maxLength={30}
            minLength={1}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full py-3 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none transition-all"
            placeholder={t('addATask')}
          />
        </div>
      </form>
    </div>
  );
}
