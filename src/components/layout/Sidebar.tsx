"use client"

import React, { useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { cn, fileToBase64 } from '@/lib/utils';
import { List as ListIcon, Plus, X, Upload, Type } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { ListSettings } from '@/components/layout/ListSettings';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import { Slider } from '@/components/ui/slider';

// ── Text-colour presets ──────────────────────────────────────────────────────
const TEXT_COLORS = [
  { label: 'Auto', value: '' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
  { label: 'Light', value: '#f1f5f9' },
  { label: 'Dark', value: '#1e293b' },
  { label: 'Yellow', value: '#fde68a' },
];

// ── Background controls (shown for any /list/* route) ────────────────────────
function SidebarBackgroundControls() {
  const pathname = usePathname();
  const { lists, updateListSettings, updateSpecialListSettings, specialListSettings } = useTaskStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslation();

  // Extract list ID from pathname /list/[id]
  const match = pathname?.match(/^\/list\/(.+)$/);
  const currentId = match ? match[1] : null;
  if (!currentId) return null;

  const realList = lists.find(l => l.id === currentId);
  const isSpecial = currentId === 'all' || !realList;
  const sp = currentId ? specialListSettings[currentId] : undefined;

  const bgValue  = realList?.background  || sp?.background;
  const bgOpacity = realList?.bgOpacity  ?? sp?.bgOpacity ?? 1;
  const textColor = realList?.textColor  || sp?.textColor || '';

  const setBg = (bg: string) => {
    if (isSpecial) updateSpecialListSettings(currentId, { background: bg });
    else           updateListSettings(currentId, { background: bg });
  };

  const setOpacity = (val: number | readonly number[]) => {
    const v = Array.isArray(val) ? (val as number[])[0] : (val as number);
    if (isSpecial) updateSpecialListSettings(currentId, { bgOpacity: v });
    else           updateListSettings(currentId, { bgOpacity: v });
  };

  const setTextColor = (c: string) => {
    if (isSpecial) updateSpecialListSettings(currentId, { textColor: c });
    else           updateListSettings(currentId, { textColor: c });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File quá lớn, hãy chọn ảnh dưới 2MB'); return; }
    const base64 = await fileToBase64(file);
    setBg(base64);
    e.target.value = '';
  };

  return (
    <details className="mt-3 pt-3 border-t border-border/50 group">
      <summary className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 cursor-pointer flex items-center justify-between outline-none list-none [&::-webkit-details-marker]:hidden hover:text-primary transition-colors">
        {t('appearance')}
        <svg className="w-4 h-4 transition-transform group-open:-scale-y-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </summary>
      
      <div className="space-y-3 mt-3">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />

        {/* Upload button */}
        <Button
          variant="ghost" size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          {t('uploadBackground')}
        </Button>

        {/* Solid color presets */}
        <div className="px-1">
          <p className="text-xs text-muted-foreground mb-1.5">{t('solidColor')}</p>
          <div className="flex flex-wrap gap-1.5">
            {['transparent','#0f172a','#1e3a5f','#14532d','#7c2d12','#4c1d95','#831843','#164e63'].map(c => (
              <button
                key={c}
                title={c}
                onClick={() => setBg(c)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none",
                  bgValue === c ? "border-primary scale-110" : "border-transparent",
                  c === 'transparent' ? 'border-border bg-muted/50' : ''
                )}
                style={{ backgroundColor: c === 'transparent' ? undefined : c }}
              />
            ))}
          </div>
        </div>

        {/* Opacity slider (only if bg set) */}
        {bgValue && bgValue !== 'transparent' && (
          <div className="px-1 space-y-1">
            <label className="text-xs text-muted-foreground flex justify-between">
              <span>{t('opacity')}</span>
              <span>{Math.round(bgOpacity * 100)}%</span>
            </label>
            <Slider value={[bgOpacity]} max={1} step={0.01} onValueChange={setOpacity} />
          </div>
        )}

        {/* Text color */}
        <div className="px-1">
          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
            <Type className="w-3 h-3" /> {t('textColor')}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="color"
              value={textColor || '#000000'}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-6 h-6 rounded-full border-2 border-border p-0 cursor-pointer overflow-hidden outline-none bg-transparent"
              title={t('customColor') as string}
            />
            {TEXT_COLORS.map(({ label, value }) => (
              <button
                key={label}
                title={label}
                onClick={() => setTextColor(value)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none text-[9px] font-bold",
                  textColor === value ? "border-primary scale-110" : "border-border",
                )}
                style={{
                  backgroundColor: value || '#94a3b8',
                  color: value === '#ffffff' || value === '#f1f5f9' || value === '#fde68a' ? '#000' : '#fff'
                }}
              >
                {label === 'Auto' ? 'A' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Remove background */}
        {bgValue && bgValue !== 'transparent' && (
          <button
            onClick={() => setBg('transparent')}
            className="text-xs text-muted-foreground hover:text-destructive px-1 transition-colors"
          >
            {t('removeBackground')}
          </button>
        )}
      </div>
    </details>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const { lists, addList, statusColors, updateStatusColors } = useTaskStore();
  const { isSidebarOpen, setSidebarOpen, language, setLanguage, sidebarWidth, setSidebarWidth } = useUiStore();
  const t = useTranslation();
  const { theme, setTheme, themes } = useTheme();
  const pathname = usePathname();


  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > window.innerWidth / 2) newWidth = window.innerWidth / 2;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

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
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-64 md:w-[var(--sidebar-width)] flex-shrink-0",
          "bg-muted border-r border-border/50",
          "transition-transform duration-300 ease-in-out",
          !isSidebarOpen && "-translate-x-full md:translate-x-0 md:!w-0 md:opacity-0 md:overflow-hidden",
          isResizing && "transition-none"
        )}
      >
        {/* Resizer */}
        <div
          className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary z-50 transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        <div className="flex flex-col h-full w-full p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Next To-Do
            </h1>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto space-y-1 pr-2">
            {/* All Tasks link */}
            <Link
              href="/list/all"
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
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

            {/* Important tasks link */}
            <Link
              href="/list/important"
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                "hover:bg-primary/10 group mb-2",
                pathname === '/list/important' ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
              )}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <span className={cn(pathname === '/list/important' ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors")}>
                <span className="text-lg leading-none flex items-center justify-center w-5 h-5">⭐</span>
              </span>
              <span className="truncate">{t('important')}</span>
            </Link>

            {/* Separator */}
            <div className="h-px bg-border my-3 mx-2" />

            {/* User lists */}
            {lists.map((list) => {
              const isActive = pathname === `/list/${list.id}`;
              return (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                    "hover:bg-primary/10 group",
                    isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
                  )}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={cn("flex flex-shrink-0 items-center justify-center w-5 h-5", isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary transition-colors")}>
                    {list.icon
                      ? <span className="text-base leading-none">{list.icon}</span>
                      : <ListIcon className="w-4 h-4" />}
                  </span>
                  <span className="truncate flex-1">{list.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    <ListSettings listId={list.id} />
                  </div>
                </Link>
              );
            })}

            {/* Background / appearance controls */}
            <SidebarBackgroundControls />
          </nav>

          {/* Bottom actions */}
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

            {/* Global Settings dialog */}
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
                  {/* Language */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('language')}</label>
                    <div className="flex gap-2">
                      <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
                      <Button variant={language === 'vi' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
                    </div>
                  </div>
                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{t('theme')}</label>
                    <div className="flex gap-2 flex-wrap max-w-[200px] justify-end">
                      {themes.map(th => (
                        <Button key={th} variant={theme === th ? 'default' : 'outline'} size="sm" onClick={() => setTheme(th)} className="capitalize">
                          {th.replace('theme-', '')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Status colours */}
                  {(['done', 'in_progress', 'unfinished'] as const).map(k => (
                    <div key={k}>
                      <label className="text-sm font-medium">{t(`${k}StatusColor` as any)}</label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={statusColors[k]}
                          onChange={(e) => updateStatusColors({ [k]: e.target.value })}
                          className="w-8 h-8 rounded border-none p-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-sm font-mono flex items-center">{statusColors[k]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </aside>
    </>
  );
}
