"use client"

import { useAuthStore } from '@/lib/useAuthStore';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export function LoginForm() {
  const { loginWithGoogle, isLoading } = useAuthStore();

  return (
    <div className="flex flex-col space-y-4">
      <Button 
        onClick={loginWithGoogle} 
        disabled={isLoading}
        className="w-full h-12 text-md font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2E] flex items-center justify-center gap-3 transition-colors"
      >
        <FcGoogle className="w-6 h-6" />
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>
    </div>
  );
}
