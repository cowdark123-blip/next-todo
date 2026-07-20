"use client"

import React, { useState, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import { cn, fileToBase64 } from '@/lib/utils';
import { List as ListIcon, Plus, X, Upload, Type, ArrowDownUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { Settings, LogIn, LogOut } from 'lucide-react';
import { ListSettings } from '@/components/layout/ListSettings';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/useAuthStore';
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
  const { session, profile, loginWithGoogle, logout } = useAuthStore();

  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [listsCollapsed, setListsCollapsed] = useState(false);

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
          "bg-background border-r-[3px] border-border",
          "transition-transform duration-300 ease-in-out",
          !isSidebarOpen && "-translate-x-full md:translate-x-0 md:!w-0 md:opacity-0 md:overflow-hidden",
          isResizing && "transition-none"
        )}
      >
        {/* Resizer */}
        <div
          className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary z-50 transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />

        <div className="flex flex-col h-full w-full p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Next To-Do
            </h1>
            <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto space-y-1 pr-2">
            {/* All Tasks link */}
            <Link
              href="/list/all"
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 mb-1",
                pathname === '/list/all' ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-foreground/80 hover:bg-muted font-medium hover:text-foreground"
              )}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <span className={cn(pathname === '/list/all' ? "text-primary-foreground" : "text-muted-foreground")}>
                <span className="text-lg leading-none flex items-center justify-center w-5 h-5">📋</span>
              </span>
              <span className="truncate">{t('allTasks')}</span>
            </Link>

            {/* Important tasks link */}
            <Link
              href="/list/important"
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 mb-2",
                pathname === '/list/important' ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-foreground/80 hover:bg-muted font-medium hover:text-foreground"
              )}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <span className={cn(pathname === '/list/important' ? "text-primary-foreground" : "text-muted-foreground")}>
                <span className="text-lg leading-none flex items-center justify-center w-5 h-5">⭐</span>
              </span>
              <span className="truncate">{t('important')}</span>
            </Link>

            {/* Separator with collapse toggle and sort */}
            <div className="flex items-center gap-2 my-5 mx-1">
              <div className="flex-1 h-px bg-border" />
              <button
                onClick={() => setListsCollapsed(c => !c)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>{t('myLists')}</span>
                <svg
                  className={cn("w-3 h-3 transition-transform duration-200", listsCollapsed ? "-rotate-90" : "")}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* List Sort Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground focus:outline-none flex items-center ml-1">
                  <ArrowDownUp className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => {
                    if (useUiStore.getState().listSortBy === 'manual') useUiStore.getState().setListSortOrder(useUiStore.getState().listSortOrder === 'asc' ? 'desc' : 'asc');
                    else useUiStore.getState().setListSortBy('manual');
                  }} className="flex justify-between">
                    {t('sortManual')} {useUiStore.getState().listSortBy === 'manual' && (useUiStore.getState().listSortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (useUiStore.getState().listSortBy === 'name') useUiStore.getState().setListSortOrder(useUiStore.getState().listSortOrder === 'asc' ? 'desc' : 'asc');
                    else useUiStore.getState().setListSortBy('name');
                  }} className="flex justify-between">
                    {t('sortName')} {useUiStore.getState().listSortBy === 'name' && (useUiStore.getState().listSortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (useUiStore.getState().listSortBy === 'date') useUiStore.getState().setListSortOrder(useUiStore.getState().listSortOrder === 'asc' ? 'desc' : 'asc');
                    else useUiStore.getState().setListSortBy('date');
                  }} className="flex justify-between">
                    {t('sortDate')} {useUiStore.getState().listSortBy === 'date' && (useUiStore.getState().listSortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* User lists */}
            {!listsCollapsed && (() => {
              const { listSortBy, listSortOrder } = useUiStore.getState();
              const sortedLists = [...lists];
              if (listSortBy === 'manual') {
                if (listSortOrder === 'desc') sortedLists.reverse();
              } else {
                sortedLists.sort((a, b) => {
                  let diff = 0;
                  if (listSortBy === 'name') diff = a.name.localeCompare(b.name);
                  else if (listSortBy === 'date') diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  return listSortOrder === 'asc' ? diff : -diff;
                });
              }
              return sortedLists;
            })().map((list) => {
              const isActive = pathname === `/list/${list.id}`;
              return (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors duration-200 group mb-1",
                    isActive ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-foreground/80 hover:bg-muted font-medium hover:text-foreground"
                  )}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={cn("flex flex-shrink-0 items-center justify-center w-5 h-5", isActive ? "text-primary-foreground opacity-100" : "text-muted-foreground opacity-70 group-hover:opacity-100 transition-colors")}>
                    {list.icon
                      ? <span className="text-base leading-none">{list.icon}</span>
                      : <ListIcon className="w-4 h-4" />}
                  </span>
                  <span className="truncate flex-1">{list.name}</span>
                  <div className={cn("opacity-0 focus-within:opacity-100 transition-opacity duration-200", isActive ? "opacity-100" : "group-hover:opacity-100")}>
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
                  className="w-full px-3 py-2 text-sm bg-background border-2 border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  onBlur={() => !newListName && setIsAddingList(false)}
                />
              </form>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground/80 hover:bg-muted hover:text-foreground font-medium"
                onClick={() => setIsAddingList(true)}
              >
                <Plus className="w-5 h-5 mr-3" />
                {t('newList')}
              </Button>
            )}

            {/* Global Settings */}
            <details className="group mt-2">
              <summary className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-foreground/80 hover:text-foreground hover:bg-muted cursor-pointer transition-colors outline-none list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3 opacity-70" />
                  {t('settings')}
                </div>
                <svg className="w-4 h-4 transition-transform group-open:-scale-y-100 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div className="px-3 py-3 space-y-4 bg-muted/50 rounded-lg mt-1 mx-1 border-2 border-border">
                {/* Language */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('language')}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
                    className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{t('theme')}</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer capitalize"
                  >
                    {themes.map(th => (
                      <option key={th} value={th}>
                        {th.replace('theme-', '')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status colours */}
                <div className="space-y-2">
                  {(['done', 'in_progress', 'unfinished'] as const).map(k => (
                    <div key={k} className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">{t(`${k}StatusColor` as any)}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={statusColors[k]}
                          onChange={(e) => updateStatusColors({ [k]: e.target.value })}
                          className="w-6 h-6 rounded-full border-none p-0 bg-transparent cursor-pointer overflow-hidden outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* Auth UI */}
            <div className="mt-2">
              {session ? (
                <details className="group mt-2">
                  <summary className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-foreground/80 hover:text-foreground hover:bg-muted cursor-pointer transition-colors outline-none list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full ring-2 ring-border" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {profile?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="truncate max-w-[120px]">{profile?.full_name || t('profile')}</span>
                    </div>
                    <svg className="w-4 h-4 transition-transform group-open:-scale-y-100 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </summary>
                  <div className="px-3 py-2 space-y-2 bg-muted/50 rounded-lg mt-1 mx-1 border-2 border-border">
                    <p className="text-xs text-muted-foreground truncate" title={profile?.email}>{profile?.email}</p>
                    
                    <Link
                      href="/profile"
                      className="w-full flex items-center text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-background h-8 px-2 rounded-md transition-colors border border-transparent hover:border-border"
                      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2 opacity-70" />
                      {t('editProfile')}
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                      onClick={() => logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </Button>
                  </div>
                </details>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-primary mt-2"
                  onClick={() => loginWithGoogle()}
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  {t('login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
