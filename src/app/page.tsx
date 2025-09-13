// src/app/page.tsx

import { LoginForm } from "@/app/ui/login-form";
import Link from "next/link";
import Logo from "@/app/ui/logo";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      {/* Responsive container: full width on small screens, max-width on larger screens */}
      <div className="relative mx-auto flex w-full max-w-sm sm:max-w-md md:max-w-lg flex-col space-y-4 items-center">
        <Logo size={500} />
        <h1 className="text-2xl md:text-3xl font-bold pt-6">
          Please log in to continue
        </h1>
        <LoginForm />
        <div className="mt-4 text-center text-sm md:text-base">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}