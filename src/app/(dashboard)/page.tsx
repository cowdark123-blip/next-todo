"use client"
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTaskStore } from '@/store/useTaskStore';

export default function DashboardPage() {
  const lists = useTaskStore((state) => state.lists);
  const list = lists.find(l => l.id === 'default-1');

  if (!list) return null;

  return (
    <div className="h-full flex flex-col relative rounded-xl overflow-hidden -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      {list.background && (
        <div 
          className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: list.background.startsWith('http') || list.background.startsWith('data:') ? `url(${list.background}) center/cover` : list.background,
            opacity: list.bgOpacity ?? 1
          }}
        />
      )}
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
            <p className="text-muted-foreground mt-1">What are you focusing on today?</p>
          </div>
          <ListSettings listId="default-1" />
        </div>
        
        <div className="flex-1">
          <TaskList listId="default-1" />
        </div>
      </div>
    </div>
  );
}
