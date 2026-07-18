"use client"
import React from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { Check, Star, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskCompletion, toggleTaskImportance } = useTaskStore();

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-3 mb-2 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm transition-all",
        "hover:shadow-md hover:border-primary/20",
        isDragging && "opacity-50 scale-105 z-50 shadow-xl border-primary/50",
        task.completed && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <button
        onClick={() => toggleTaskCompletion(task.id)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
          task.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {task.completed && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 min-w-0 cursor-pointer">
        <p className={cn(
          "text-sm font-medium truncate transition-all",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
      </div>

      <button
        onClick={() => toggleTaskImportance(task.id)}
        className={cn(
          "p-2 rounded-full transition-colors",
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
