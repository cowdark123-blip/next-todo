"use client"
import React, { useState } from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { Check, Star, GripVertical, Circle, CheckCircle, Play, MoreHorizontal, Trash, Palette, MoveRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { triggerConfetti } from '@/lib/confetti';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTaskStatus, toggleTaskImportance, updateTask, deleteTask, moveTask, lists, statusColors } = useTaskStore();
  const { setActiveTask } = useUiStore();
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);

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

  const handleStatusChange = (e: React.MouseEvent, status: 'done' | 'in_progress' | 'unfinished') => {
    e.stopPropagation();
    if (status === 'done' && task.status !== 'done') {
      triggerConfetti();
      const audio = new Audio('/sounds/success-ting.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Catch error if file missing or browser blocks autoplay
    }
    updateTaskStatus(task.id, status);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: statusColors?.[task.status] || 'transparent' }}
      onClick={() => setActiveTask(task.id)}
      className={cn(
        "group flex items-center gap-2 p-3 mb-2 rounded-lg border-2 bg-background/50 backdrop-blur-sm transition-all cursor-pointer",
        "hover:shadow-md hover:brightness-110",
        isDragging && "opacity-50 scale-105 z-50 shadow-xl",
        task.status === 'done' && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 -ml-1"
      >
        <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <div className="flex items-center gap-1 shrink-0 bg-background/50 p-1 rounded-md border border-border/50 mr-1">
        <button
          onClick={(e) => handleStatusChange(e, 'unfinished')}
          className={cn("w-6 h-6 rounded flex items-center justify-center transition-colors", task.status === 'unfinished' ? "bg-red-500/20 text-red-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="Unfinished"
        >
          <Circle className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => handleStatusChange(e, 'in_progress')}
          className={cn("w-6 h-6 rounded flex items-center justify-center transition-colors", task.status === 'in_progress' ? "bg-blue-500/20 text-blue-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="In Progress"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => handleStatusChange(e, 'done')}
          className={cn("w-6 h-6 rounded flex items-center justify-center transition-colors", task.status === 'done' ? "bg-green-500/20 text-green-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="Done"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {task.icon && task.status !== 'done' && (
          <span className="text-base flex-shrink-0 leading-none">{task.icon}</span>
        )}
        <p className={cn(
          "text-sm font-medium truncate transition-all",
          task.status === 'done' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {task.steps?.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3 px-2 py-0.5 bg-muted/80 rounded-full whitespace-nowrap">
            <CheckCircle className="w-3 h-3" />
            <span>{task.steps.filter(s => s.isCompleted).length}/{task.steps.length}</span>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 focus:outline-none"
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end" className="w-48">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEmojiDialog(true); }}>
            <Palette className="w-4 h-4 mr-2" /> Change Icon
          </DropdownMenuItem>
          {task.icon && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateTask(task.id, { icon: undefined }); }}>
              <ImageOff className="w-4 h-4 mr-2" /> Remove Icon
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MoveRight className="w-4 h-4 mr-2" /> Move to List
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {lists.filter(l => l.id !== task.listId).map(l => (
                <DropdownMenuItem key={l.id} onClick={(e) => { e.stopPropagation(); moveTask(task.id, l.id); }}>
                  {l.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <Dialog open={showEmojiDialog} onOpenChange={setShowEmojiDialog}>
        <DialogContent className="w-fit p-0 border-none bg-transparent shadow-none" onClick={(e) => e.stopPropagation()}>
          <EmojiPicker 
            theme={Theme.DARK}
            onEmojiClick={(emoji) => {
              updateTask(task.id, { icon: emoji.emoji });
              setShowEmojiDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
