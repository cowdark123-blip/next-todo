"use client"
import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { Menu, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MiniModeButton } from '@/components/layout/MiniModeButton';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useTranslation } from '@/lib/i18n';

export function Header() {
  const { toggleSidebar } = useUiStore();
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const t = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 sm:gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1" />

      {/* PWA Install Button */}
      {isInstallable && !isInstalled && (
        <Button
          variant="outline"
          size="sm"
          onClick={installApp}
          className="h-8 gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 transition-colors shadow-sm animate-pulse"
          title={t('installApp')}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('installApp')}</span>
        </Button>
      )}

      {!isInstallable && !isInstalled && (
        <Button
          variant="outline"
          size="sm"
          onClick={installApp}
          className="h-8 gap-1.5 text-xs font-semibold border-primary/30 text-primary/80 hover:bg-primary/10 transition-colors shadow-sm"
          title={t('installApp')}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('installApp')}</span>
        </Button>
      )}

      {isInstalled && (
        <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <Check className="h-3 w-3" />
          {t('appInstalled')}
        </span>
      )}

      <MiniModeButton />
    </header>
  );
}
