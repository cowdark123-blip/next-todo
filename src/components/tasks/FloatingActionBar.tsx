"use client"
import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useTaskStore } from '@/store/useTaskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, X } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

export function FloatingActionBar() {
  const { selectedTaskIds, clearSelection } = useUiStore();
  const { completeTasks, deleteTasks } = useTaskStore();

  const count = selectedTaskIds.length;
  if (count === 0) return null;

  const handleComplete = () => {
    triggerConfetti();
    const audio = new Audio('/sounds/success-ting.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
    completeTasks(selectedTaskIds);
    clearSelection();
  };

  const handleDelete = () => {
    // Ideally we could use a confirm dialog here, but for bulk operations a prompt or direct delete is okay for now.
    if (window.confirm(`Are you sure you want to delete ${count} tasks?`)) {
      deleteTasks(selectedTaskIds);
      clearSelection();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-background/90 backdrop-blur-xl border border-border shadow-2xl rounded-full"
      >
        <div className="flex items-center gap-2 border-r border-border pr-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
            {count}
          </span>
          <span className="text-sm font-medium">selected</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>

        <button
          onClick={clearSelection}
          className="ml-2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
