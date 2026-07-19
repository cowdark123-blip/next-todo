"use client"

import React, { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';
import { Home, Star, Sun, List as ListIcon, Plus, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, MoreHorizontal } from 'lucide-react';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from 'next-themes';

export function Sidebar() {
  const { lists, addList, statusColors, updateStatusColors } = useTaskStore();
  const { isSidebarOpen, setSidebarOpen, language, setLanguage } = useUiStore();
  const t = useTranslation();
  const { theme, setTheme, themes } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      addList(newListName.trim(), '📁');
      setNewListName('');
      setIsAddingList(false);
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
            <Link
              href="/list/all"
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-primary/10 group mb-2",
                pathname === '/list/all' ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
              )}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <span className={cn(pathname === '/list/all' ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")}>
                <span className="text-lg leading-none flex items-center justify-center w-5 h-5">📋</span>
              </span>
              <span className="truncate">{t('allTasks')}</span>
            </Link>

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
                  <span className={cn("text-lg leading-none flex items-center justify-center w-5 h-5", isActive ? "opacity-100 grayscale-0" : "opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all")}>
                    {list.icon === 'Sun' ? '☀️' : 
                     list.icon === 'Star' ? '⭐' : 
                     list.icon === 'Home' ? '🏠' : 
                     list.icon === 'ListIcon' ? '📁' : 
                     (list.icon || '📁')}
                  </span>
                  <span className="truncate">{list.name}</span>
                  <ListSettings listId={list.id} />
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
                  required
                  maxLength={30}
                  minLength={1}
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder={t('newListName')}
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
                {t('newList')}
              </Button>
            )}
            <Dialog>
              <DialogTrigger className="w-full">
                <div className="flex w-full items-center justify-start px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-primary hover:bg-accent mt-2 cursor-pointer transition-colors">
                  <Settings className="w-5 h-5 mr-3" />
                  {t('settings')}
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('language')}</label>
                    <div className="flex gap-2">
                      <Button 
                        variant={language === 'en' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('en')}
                      >
                        EN
                      </Button>
                      <Button 
                        variant={language === 'vi' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('vi')}
                      >
                        VI
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('theme')}</label>
                    <div className="flex gap-2 flex-wrap max-w-[200px] justify-end">
                      {themes.map(t => (
                        <Button 
                          key={t}
                          variant={theme === t ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setTheme(t)}
                          className="capitalize"
                        >
                          {t.replace('theme-', '')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('doneStatusColor')}</label>
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="color" 
                        value={statusColors.done} 
                        onChange={(e) => updateStatusColors({ done: e.target.value })}
                        className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-sm font-mono flex items-center">{statusColors.done}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('inProgressStatusColor')}</label>
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="color" 
                        value={statusColors.in_progress} 
                        onChange={(e) => updateStatusColors({ in_progress: e.target.value })}
                        className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-sm font-mono flex items-center">{statusColors.in_progress}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('unfinishedStatusColor')}</label>
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="color" 
                        value={statusColors.unfinished} 
                        onChange={(e) => updateStatusColors({ unfinished: e.target.value })}
                        className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-sm font-mono flex items-center">{statusColors.unfinished}</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </aside>
    </>
  );
}
