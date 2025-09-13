// src/app/signup/page.tsx

import { SignUpForm } from './signup-form';
import Logo from '@/app/ui/logo';

export default function SignUpPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      {/* Responsive container */}
      <div className="relative mx-auto flex w-full max-w-sm sm:max-w-md md:max-w-lg flex-col space-y-4 items-center">
        <Logo size={200} />
        <h1 className="text-2xl md:text-3xl font-bold pt-6">Create an Account</h1>
        <SignUpForm />
      </div>
    </main>
  );
}