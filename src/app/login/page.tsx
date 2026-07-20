import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-[#1C1C1E]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Next Todo</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Login to sync your tasks across devices
          </p>
        </div>
        
        <LoginForm />
        
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
