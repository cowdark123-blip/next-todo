"use client"
import React from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTaskStore } from '@/store/useTaskStore';
import { useParams } from 'next/navigation';
import { SpecialListSettings } from '@/types';

function BackgroundLayer({ background, bgOpacity }: { background?: string; bgOpacity?: number }) {
  if (!background || background === 'transparent') return null;
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

interface PageHeaderProps {
  title: string;
  description?: string;
  textColor?: string;
  settings?: React.ReactNode;
}

function PageHeader({ title, description, textColor, settings }: PageHeaderProps) {
  const style = textColor ? { color: textColor } : undefined;
  return (
    <div className="mb-6 flex items-start justify-between gap-4 [.is-pip-mode_&]:mb-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm [.is-pip-mode_&]:text-xl" style={style}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm opacity-80 drop-shadow-sm [.is-pip-mode_&]:hidden" style={style}>
            {description}
          </p>
        )}
      </div>
      {settings}
    </div>
  );
}

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const lists = useTaskStore((state) => state.lists);
  const specialListSettings = useTaskStore((state) => state.specialListSettings);

  // ── All Tasks (virtual list) ──────────────────────────────────────────────
  if (listId === 'all') {
    const sp: SpecialListSettings = specialListSettings['all'] ?? {};
    return (
      <div className="h-full flex flex-col relative">
        <BackgroundLayer background={sp.background} bgOpacity={sp.bgOpacity} />
        <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 [.is-pip-mode_&]:p-2">
          <PageHeader
            title="All Tasks"
            description={sp.description || "Here is everything on your plate."}
            textColor={sp.textColor}
          />
          <div className="flex-1">
            <TaskList listId="all" />
          </div>
        </div>
      </div>
    );
  }

  // ── Regular list ──────────────────────────────────────────────────────────
  const list = lists.find(l => l.id === listId);

  if (!list) {
    return (
      <div className="h-full flex flex-col relative">
        <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 [.is-pip-mode_&]:p-2">
          <div className="mb-6 animate-pulse [.is-pip-mode_&]:mb-2">
            <div className="h-8 bg-muted rounded w-48 mb-2" />
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
      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 [.is-pip-mode_&]:p-2">
        <PageHeader
          title={list.name}
          description={list.description}
          textColor={list.textColor}
          settings={<ListSettings listId={list.id} />}
        />
        <div className="flex-1">
          <TaskList listId={listId} />
        </div>
      </div>
    </div>
  );
}
