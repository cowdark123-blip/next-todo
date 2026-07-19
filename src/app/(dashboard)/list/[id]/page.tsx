"use client"
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTaskStore } from '@/store/useTaskStore';
import { useParams } from 'next/navigation';

function BackgroundLayer({ background, bgOpacity }: { background?: string; bgOpacity?: number }) {
  if (!background) return null;
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
      style={{
        background: background.startsWith('http') || background.startsWith('data:')
          ? `url("${background}") center/cover no-repeat`
          : background,
        opacity: bgOpacity ?? 1,
      }}
    />
  );
}

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const lists = useTaskStore((state) => state.lists);
  const specialListSettings = useTaskStore((state) => state.specialListSettings);

  if (listId === 'all') {
    const sp = specialListSettings['all'];
    return (
      <div className="h-full flex flex-col relative">
        <BackgroundLayer background={sp?.background} bgOpacity={sp?.bgOpacity} />
        <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
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
    const sp = specialListSettings[listId];
    return (
      <div className="h-full flex flex-col relative">
        <BackgroundLayer background={sp?.background} bgOpacity={sp?.bgOpacity} />
        <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          <div className="mb-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          </div>
          <div className="flex-1">
            <TaskList listId={listId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <BackgroundLayer background={list.background} bgOpacity={list.bgOpacity} />
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
          <ListSettings listId={list.id} />
        </div>

        <div className="flex-1">
          <TaskList listId={listId} />
        </div>
      </div>
    </div>
  );
}
