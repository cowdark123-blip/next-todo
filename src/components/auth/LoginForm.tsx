"use client"

import { useAuthStore } from '@/lib/useAuthStore';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function LoginForm() {
  const { loginWithGoogle, continueAsGuest, isLoading } = useAuthStore();
  const t = useTranslation();

  return (
    <div className="flex flex-col space-y-3">
      <Button 
        onClick={loginWithGoogle} 
        disabled={isLoading}
        className="w-full h-12 text-md font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2E] flex items-center justify-center gap-3 transition-colors shadow-sm"
      >
        <FcGoogle className="w-6 h-6" />
        {isLoading ? 'Connecting...' : t('login')}
      </Button>

      <Button
        variant="outline"
        onClick={continueAsGuest}
        disabled={isLoading}
        className="w-full h-12 text-md font-medium border border-dashed border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] flex items-center justify-center gap-3 transition-colors"
      >
        <User className="w-5 h-5 opacity-70" />
        {t('continueAsGuest')}
      </Button>
    </div>
  );
}
