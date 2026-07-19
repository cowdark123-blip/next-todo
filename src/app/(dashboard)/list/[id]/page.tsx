"use client"
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTaskStore } from '@/store/useTaskStore';
import { useParams } from 'next/navigation';

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const lists = useTaskStore((state) => state.lists);
  
  if (listId === 'all') {
    return (
      <div className="h-full flex flex-col relative p-4 sm:p-6 lg:p-8">
        <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
              <p className="text-muted-foreground mt-1">Here is everything on your plate.</p>
            </div>
          </div>
          <div className="flex-1">
            <TaskList listId="all" />
          </div>
        </div>
      </div>
    );
  }

  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    return (
      <div className="h-full flex flex-col">
         <div className="mb-6 animate-pulse">
           <div className="h-8 bg-muted rounded w-48 mb-2"></div>
         </div>
         <div className="flex-1">
           <TaskList listId={listId} />
         </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative p-4 sm:p-6 lg:p-8">
      {list.background && (
        <div 
          className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: list.background.startsWith('http') || list.background.startsWith('data:') ? `url("${list.background}") center/cover no-repeat` : list.background,
            opacity: list.bgOpacity ?? 1
          }}
        />
      )}
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
        </div>
        
        <div className="flex-1">
          <TaskList listId={listId} />
        </div>
      </div>
    </div>
  );
}
