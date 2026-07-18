"use client"
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { useTaskStore } from '@/store/useTaskStore';
import { useParams } from 'next/navigation';

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const lists = useTaskStore((state) => state.lists);
  
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
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
      </div>
      
      <div className="flex-1">
        <TaskList listId={listId} />
      </div>
    </div>
  );
}
