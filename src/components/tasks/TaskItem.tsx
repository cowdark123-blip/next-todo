"use client"
import React, { useState } from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { Check, Star, GripVertical, Circle, CheckCircle, Play, MoreHorizontal, Trash, Palette, MoveRight, ImageOff, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { triggerConfetti } from '@/lib/confetti';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTranslation } from '@/lib/i18n';

interface TaskItemProps {
  task: Task;
  isSubtask?: boolean;
}

export function TaskItem({ task, isSubtask }: TaskItemProps) {
  const { updateTaskStatus, toggleTaskImportance, updateTask, deleteTask, moveTask, lists, statusColors, addTask, tasks } = useTaskStore();
  const { setActiveTask } = useUiStore();
  const [showEmojiDialog, setShowEmojiDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const t = useTranslation();

  const subtasks = tasks.filter(t => t.parentId === task.id);

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

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addTask(task.listId, newSubtaskTitle.trim(), task.id);
      setNewSubtaskTitle('');
      setIsExpanded(true);
    }
  };

  return (
    <div
      ref={isSubtask ? undefined : setNodeRef}
      style={isSubtask ? undefined : { ...style }}
      className="mb-2"
    >
      <div 
        style={{ borderColor: statusColors?.[task.status] || 'transparent' }}
        onClick={() => setActiveTask(task.id)}
        className={cn(
          "group flex items-center gap-2 bg-background/50 backdrop-blur-sm transition-all cursor-pointer",
          isSubtask 
            ? "p-2 ml-4 mb-1 text-sm border border-l-4 border-l-primary/60 rounded-md scale-[0.98] origin-left hover:brightness-105" 
            : "p-3 rounded-lg border-2 hover:shadow-md hover:brightness-110",
          !isSubtask && isDragging && "opacity-50 scale-105 z-50 shadow-xl",
          task.status === 'done' && "opacity-60"
        )}
      >
        {!isSubtask && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 -ml-1"
          >
            <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

      <div className="flex items-center gap-1 shrink-0 bg-background/50 p-1 rounded-md border border-border/50 mr-1">
        <button
          onClick={(e) => handleStatusChange(e, 'unfinished')}
          className={cn("rounded flex items-center justify-center transition-colors", isSubtask ? "w-5 h-5" : "w-6 h-6", task.status === 'unfinished' ? "bg-red-500/20 text-red-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="Unfinished"
        >
          <Circle className={isSubtask ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
        <button
          onClick={(e) => handleStatusChange(e, 'in_progress')}
          className={cn("rounded flex items-center justify-center transition-colors", isSubtask ? "w-5 h-5" : "w-6 h-6", task.status === 'in_progress' ? "bg-blue-500/20 text-blue-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="In Progress"
        >
          <Play className={isSubtask ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
        <button
          onClick={(e) => handleStatusChange(e, 'done')}
          className={cn("rounded flex items-center justify-center transition-colors", isSubtask ? "w-5 h-5" : "w-6 h-6", task.status === 'done' ? "bg-green-500/20 text-green-500" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="Done"
        >
          <Check className={isSubtask ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {task.icon && task.status !== 'done' && (
          <span className="text-base flex-shrink-0 leading-none">{task.icon}</span>
        )}
        <p className={cn(
          "font-medium truncate transition-all",
          isSubtask ? "text-xs" : "text-sm",
          task.status === 'done' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        
        {subtasks.length > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="flex items-center gap-1 text-xs text-muted-foreground ml-2 px-2 py-0.5 bg-muted/80 rounded-full whitespace-nowrap hover:bg-muted transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>{subtasks.filter(s => s.status === 'done').length}/{subtasks.length}</span>
          </button>
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
          {!isSubtask && (
            <DropdownMenuItem onClick={(e) => { 
              e.stopPropagation(); 
              setIsExpanded(true);
              // Small delay to let UI expand before focusing (in real app we'd use a ref)
            }}>
              <Plus className="w-4 h-4 mr-2" /> {t('addSubtask')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEmojiDialog(true); }}>
            <Palette className="w-4 h-4 mr-2" /> {t('changeIcon')}
          </DropdownMenuItem>
          {task.icon && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateTask(task.id, { icon: undefined }); }}>
              <ImageOff className="w-4 h-4 mr-2" /> {t('removeIcon')}
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MoveRight className="w-4 h-4 mr-2" /> {t('moveToList')}
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
            <Trash className="w-4 h-4 mr-2" /> {t('delete')}
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
      
      {!isSubtask && isExpanded && (
        <div className="ml-8 mt-2 space-y-2">
          {subtasks.map(st => (
            <TaskItem key={st.id} task={st} isSubtask={true} />
          ))}
          
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 px-3 py-2 bg-background/30 rounded-lg border border-border/50">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              maxLength={30}
              minLength={1}
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder={t('addSubtask')}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </form>
        </div>
      )}
    </div>
  );
}
