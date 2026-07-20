"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ArrowDownUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
interface TaskListProps {
  listId: string;
}

export function TaskList({ listId }: TaskListProps) {
  const { tasks, reorderTasks, statusColors, lists, specialListSettings } = useTaskStore();
  const [sortBy, setSortBy] = useState<'manual' | 'starred' | 'name' | 'date'>('manual');
  const t = useTranslation();
  
  const rootTasks = tasks.filter(t => !t.parentId);
  const listTasks = listId === 'all' ? rootTasks : listId === 'important' ? rootTasks.filter(t => t.isImportant) : rootTasks.filter(t => t.listId === listId);
  
  let sortedTasks = [...listTasks];
  if (sortBy === 'starred') {
    sortedTasks.sort((a, b) => (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0));
  } else if (sortBy === 'name') {
    sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'date') {
    sortedTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const unfinishedTasks = sortedTasks.filter(t => t.status === 'unfinished');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'in_progress');
  const doneTasks = sortedTasks.filter(t => t.status === 'done');

  const textColor = listId === 'all' 
    ? specialListSettings['all']?.textColor 
    : (lists.find(l => l.id === listId)?.textColor || specialListSettings[listId]?.textColor);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderTasks(active.id as string, over.id as string);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-2">
        {listTasks.length > 0 && (
          <div className="flex justify-end mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted text-muted-foreground transition-colors focus:outline-none bg-background/50 backdrop-blur-sm shadow-sm border border-border/50">
                <ArrowDownUp className="w-3.5 h-3.5" />
                {t('sort')}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy('manual')} className="flex justify-between">
                  {t('sortManual')} {sortBy === 'manual' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('starred')} className="flex justify-between">
                  {t('sortStarred')} {sortBy === 'starred' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')} className="flex justify-between">
                  {t('sortName')} {sortBy === 'name' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date')} className="flex justify-between">
                  {t('sortDate')} {sortBy === 'date' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <DndContext 
          sensors={sortBy === 'manual' ? sensors : []}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {unfinishedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: statusColors.unfinished }}>
                {t('unfinished')} <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{unfinishedTasks.length}</span>
              </h3>
              <SortableContext items={unfinishedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {unfinishedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </SortableContext>
            </div>
          )}

          {inProgressTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: statusColors.in_progress }}>
                {t('inProgress')} <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{inProgressTasks.length}</span>
              </h3>
              <SortableContext items={inProgressTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {inProgressTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </SortableContext>
            </div>
          )}

          {doneTasks.length > 0 && (
            <div className="mb-6 opacity-70">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: statusColors.done }}>
                {t('done')} <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{doneTasks.length}</span>
              </h3>
              <SortableContext items={doneTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {doneTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </SortableContext>
            </div>
          )}
        </DndContext>

        {listTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl mt-8 bg-muted/20" style={{ color: textColor || 'currentColor' }}>
            <p className={cn("text-lg font-bold", !textColor ? "text-foreground/80" : "drop-shadow-sm")}>
              {listId === 'all' ? t('noTasksAll') as string : listId === 'important' ? t('noTasksImportant') as string : t('noTasks') as string}
            </p>
            {listId === 'all' && (
              <p className={cn("text-sm mt-2", !textColor ? "text-muted-foreground" : "opacity-80")}>{t('subtitleAll') as string}</p>
            )}
            {listId === 'important' && (
              <p className={cn("text-sm mt-2", !textColor ? "text-muted-foreground" : "opacity-80")}>{t('subtitleImportant') as string}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
