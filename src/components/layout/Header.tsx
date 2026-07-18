"use client"
import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { toggleSidebar, isSidebarOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={!isSidebarOpen ? "" : "md:hidden"}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <div className="flex-1" />
    </header>
  );
}
