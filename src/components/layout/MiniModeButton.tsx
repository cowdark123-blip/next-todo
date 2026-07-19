"use client"
import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useUiStore } from '@/store/useUiStore';
import { createPortal } from 'react-dom';

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
      window: Window | null;
    };
  }
}

let pipWindowCache: Window | null = null;

export function PipContainer({ children }: { children: React.ReactNode }) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const isPipMode = useUiStore((state) => state.isPipMode);

  useEffect(() => {
    if (isPipMode && pipWindowCache) {
      setPipWindow(pipWindowCache);
    } else {
      setPipWindow(null);
    }
  }, [isPipMode]);

  if (pipWindow) {
    return createPortal(
      <div className="h-screen w-screen overflow-hidden bg-background min-w-[280px]">
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>,
      pipWindow.document.body
    );
  }

  return <>{children}</>;
}

export function MiniModeButton() {
  const t = useTranslation();
  const { isPipMode, setPipMode } = useUiStore();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      setIsSupported(true);
    }
  }, []);

  const togglePip = async () => {
    if (!('documentPictureInPicture' in window)) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng này!");
      return;
    }

    if (pipWindowCache) {
      pipWindowCache.close();
      return;
    }

    try {
      const pipWin = await window.documentPictureInPicture!.requestWindow({
        width: 400,
        height: 600,
      });

      // Copy all styles
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            pipWin.document.head.appendChild(link);
          } else {
            const style = document.createElement('style');
            style.textContent = Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
            pipWin.document.head.appendChild(style);
          }
        } catch (e) {
          // Cross-origin stylesheet error, ignore
        }
      });

      // Copy theme classes
      pipWin.document.documentElement.className = document.documentElement.className;
      pipWin.document.body.className = document.body.className + ' is-pip-mode';

      pipWindowCache = pipWin;
      setPipMode(true);

      let resizeTimeout: NodeJS.Timeout;
      pipWin.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (pipWin.innerWidth < 280) {
            try {
              pipWin.resizeTo(280, pipWin.innerHeight);
            } catch (e) {
              // Browser might block resizeTo
            }
          }
        }, 200);
      });

      pipWin.addEventListener('pagehide', () => {
        pipWindowCache = null;
        setPipMode(false);
      });
    } catch (err) {
      console.error('Failed to open PiP window:', err);
    }
  };

  if (!isSupported) return null;

  return (
    <button 
      onClick={togglePip}
      className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center"
      title={t('miniMode') as string}
    >
      {isPipMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
    </button>
  );
}
