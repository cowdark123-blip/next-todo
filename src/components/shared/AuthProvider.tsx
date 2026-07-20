"use client"

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!session && pathname !== '/login') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/list/all');
      }
    }
  }, [session, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-[#1C1C1E]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Prevent flashing protected content before redirecting
  if (!session && pathname !== '/login') {
    return null; 
  }

  return <>{children}</>;
}
