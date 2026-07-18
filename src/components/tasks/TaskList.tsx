"use client"
import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

interface TaskListProps {
  listId: string;
}

export function TaskList({ listId }: TaskListProps) {
  const { tasks, addTask, reorderTasks } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const listTasks = tasks.filter(t => t.listId === listId);

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
    if (newTaskTitle.trim()) {
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
          <SortableContext 
            items={listTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {listTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </SortableContext>
        </DndContext>
        
        {listTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No tasks yet. Add one below!</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 right-4 md:static md:bottom-auto md:left-auto md:right-auto md:p-0">
        <form onSubmit={handleAddTask} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl leading-5 bg-background shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            placeholder="Add a task"
          />
        </form>
      </div>
    </div>
  );
}
