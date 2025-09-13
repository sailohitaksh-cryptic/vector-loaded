// src/app/ui/login-form.tsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';

export function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  return (
    <form action={dispatch} className="space-y-3 w-full">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 dark:bg-gray-800">
         <div>
            <label className="mb-3 mt-5 block text-sm md:text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="email">Email</label>
            {/* Responsive text and padding */}
            <input className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm md:py-3 md:px-4 md:text-base outline-none placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600" id="email" type="email" name="email" placeholder="Enter your email address" required />
        </div>
        <div className="mt-4">
            <label className="mb-3 mt-5 block text-sm md:text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="password">Password</label>
            {/* Responsive text and padding */}
            <input className="peer block w-full rounded-md border border-gray-200 py-2 px-3 text-sm md:py-3 md:px-4 md:text-base outline-none placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600" id="password" type="password" name="password" placeholder="Enter password" required minLength={6} />
        </div>
        <LoginButton />
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (<p className="text-sm text-red-500">{errorMessage}</p>)}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    // Responsive text and padding
    <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 text-sm md:py-3 md:text-base rounded" aria-disabled={pending}>
      Log in
    </button>
  );
}