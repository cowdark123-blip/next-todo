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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-30 transition-all duration-300
      [.is-pip-mode_&]:fixed [.is-pip-mode_&]:bottom-0 [.is-pip-mode_&]:left-0 [.is-pip-mode_&]:right-0 [.is-pip-mode_&]:translate-x-0 [.is-pip-mode_&]:w-full [.is-pip-mode_&]:max-w-none">
      <form onSubmit={handleAddTask} className="relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Floating wrapper: rounded, bordered, shadow in normal mode; flat, edge-to-edge in PiP mode */}
        <div className="flex items-center bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-2xl overflow-hidden px-3 py-1 transition-all duration-300
          [.is-pip-mode_&]:rounded-none [.is-pip-mode_&]:border-x-0 [.is-pip-mode_&]:border-b-0 [.is-pip-mode_&]:border-t [.is-pip-mode_&]:shadow-none [.is-pip-mode_&]:px-4 [.is-pip-mode_&]:py-2 [.is-pip-mode_&]:bg-background">
          <Plus className="h-5 w-5 text-muted-foreground mr-2 shrink-0 [.is-pip-mode_&]:w-4 [.is-pip-mode_&]:h-4" />
          <input
            type="text"
            maxLength={30}
            minLength={1}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full py-3 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none transition-all
              [.is-pip-mode_&]:py-2.5"
            placeholder={t('addATask')}
          />
        </div>
      </form>
    </div>
  );
}
