"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ArrowDownUp } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';

interface TaskListProps {
  listId: string;
}

export function TaskList({ listId }: TaskListProps) {
  const { tasks, addTask, reorderTasks, statusColors, lists, specialListSettings } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [sortBy, setSortBy] = useState<'manual' | 'starred' | 'name' | 'date'>('manual');
  const t = useTranslation();
  
  const rootTasks = tasks.filter(t => !t.parentId);
  const listTasks = listId === 'all' ? rootTasks : rootTasks.filter(t => t.listId === listId);
  
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && listId !== 'all') {
      addTask(listId, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] relative">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2">
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
          <div className="flex flex-col items-center justify-center h-40" style={{ color: textColor || 'currentColor' }}>
            <p className={!textColor ? "text-muted-foreground" : "font-medium drop-shadow-sm"}>{t('noTasks')}</p>
          </div>
        )}
      </div>

      {listId !== 'all' && (
        <div className="sticky bottom-0 left-0 right-0 p-3 mt-auto z-20 bg-background/90 backdrop-blur-md border-t border-border/50 md:p-0 md:bg-transparent md:border-none md:backdrop-blur-none md:mt-4 [.is-pip-mode_&]:!p-0 [.is-pip-mode_&]:!border-none [.is-pip-mode_&]:!bg-background">
          <form onSubmit={handleAddTask} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 [.is-pip-mode_&]:pl-4 flex items-center pointer-events-none">
              <Plus className="h-5 w-5 [.is-pip-mode_&]:w-4 [.is-pip-mode_&]:h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              maxLength={30}
              minLength={1}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 [.is-pip-mode_&]:py-3 border border-border rounded-xl leading-5 bg-background shadow-md md:shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all [.is-pip-mode_&]:!rounded-none [.is-pip-mode_&]:!border-x-0 [.is-pip-mode_&]:!border-b-0 [.is-pip-mode_&]:!border-t [.is-pip-mode_&]:!shadow-none [.is-pip-mode_&]:focus:!ring-0 [.is-pip-mode_&]:focus:!border-t-primary"
              placeholder={t('addATask')}
            />
          </form>
        </div>
      )}
    </div>
  );
}
