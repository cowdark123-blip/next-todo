"use client"

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';
import { Home, Star, Sun, List as ListIcon, Plus, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { lists, addList } = useTaskStore();
  const { isSidebarOpen, setSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      addList(newListName.trim(), 'ListIcon');
      setNewListName('');
      setIsAddingList(false);
    }
  };

  const renderIcon = (iconStr?: string) => {
    switch (iconStr) {
      case 'Sun': return <Sun className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'ListIcon': return <ListIcon className="w-5 h-5" />;
      default: 
        if (iconStr) {
           return <span className="text-lg leading-none flex items-center justify-center w-5 h-5">{iconStr}</span>;
        }
        return <ListIcon className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0",
          "bg-background/60 backdrop-blur-xl border-r border-border/50",
          "transition-transform duration-300 ease-in-out",
          !isSidebarOpen && "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full w-64 p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Next To-Do
            </h1>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1 pr-2">
            {lists.map((list) => {
              const isActive = pathname === `/list/${list.id}` || (pathname === '/' && list.id === 'default-1');
              
              return (
                <Link
                  key={list.id}
                  href={list.id === 'default-1' ? '/' : `/list/${list.id}`}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 group",
                    isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
                  )}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")}>
                    {renderIcon(list.icon)}
                  </span>
                  <span className="truncate">{list.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-border/50">
            {isAddingList ? (
              <form onSubmit={handleAddList} className="flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onBlur={() => !newListName && setIsAddingList(false)}
                />
              </form>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-primary"
                onClick={() => setIsAddingList(true)}
              >
                <Plus className="w-5 h-5 mr-3" />
                New List
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
