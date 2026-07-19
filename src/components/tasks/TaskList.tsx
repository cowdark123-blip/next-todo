"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface TaskListProps {
  listId: string;
}

export function TaskList({ listId }: TaskListProps) {
  const { tasks, addTask, reorderTasks, statusColors } = useTaskStore();
  const { tasks, addTask, reorderTasks } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const t = useTranslation();
  
  const rootTasks = tasks.filter(t => !t.parentId);
  const listTasks = listId === 'all' ? rootTasks : rootTasks.filter(t => t.listId === listId);
  const unfinishedTasks = listTasks.filter(t => t.status === 'unfinished');
  const inProgressTasks = listTasks.filter(t => t.status === 'in_progress');
  const doneTasks = listTasks.filter(t => t.status === 'done');

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
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto pr-2 pb-24 space-y-2">
        
        <DndContext 
          sensors={sensors}
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
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>{t('noTasks')}</p>
          </div>
        )}
      </div>

      {listId !== 'all' && (
        <div className="absolute bottom-8 left-4 right-4 md:static md:bottom-auto md:left-auto md:right-auto md:p-0 z-10 md:mb-6">
          <form onSubmit={handleAddTask} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              maxLength={30}
              minLength={1}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-background shadow-lg md:shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
              placeholder={t('addATask')}
            />
          </form>
        </div>
      )}
    </div>
  );
}
