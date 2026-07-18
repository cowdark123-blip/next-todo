"use client"
import React from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { Check, Star, GripVertical, Circle, CheckCircle, Heart, Coffee, Briefcase, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { triggerConfetti } from '@/lib/confetti';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskCompletion, toggleTaskImportance } = useTaskStore();
  const { setActiveTask } = useUiStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      triggerConfetti();
      const audio = new Audio('/sounds/success-ting.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Catch error if file missing or browser blocks autoplay
    }
    toggleTaskCompletion(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setActiveTask(task.id)}
      className={cn(
        "group flex items-center gap-3 p-3 mb-2 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm transition-all cursor-pointer",
        "hover:shadow-md hover:border-primary/20",
        isDragging && "opacity-50 scale-105 z-50 shadow-xl border-primary/50",
        task.completed && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <button
        onClick={handleToggle}
        className={cn(
          "w-5 h-5 min-w-5 min-h-5 rounded-full border-2 flex items-center justify-center transition-colors",
          task.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {task.icon && !task.completed && (
          <span className="text-base flex-shrink-0 leading-none">{task.icon}</span>
        )}
        <p className={cn(
          "text-sm font-medium truncate transition-all",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.steps?.length > 0 && (
          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
            {task.steps.filter(s => s.isCompleted).length}/{task.steps.length}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskImportance(task.id);
        }}
        className={cn(
          "p-2 rounded-full transition-colors flex-shrink-0",
          task.isImportant 
            ? "text-yellow-500 hover:bg-yellow-500/10" 
            : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 opacity-0 group-hover:opacity-100"
        )}
      >
        <Star className={cn("w-4 h-4", task.isImportant && "fill-current")} />
      </button>
    </div>
  );
}
