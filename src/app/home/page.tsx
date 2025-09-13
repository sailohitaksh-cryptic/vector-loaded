// src/app/home/page.tsx

import { auth, signOut } from "@/../auth";
import ImageGalleries from "@/app/ui/image-galleries";
import { fetchImagePages } from "@/app/lib/data";

export default async function HomePage() {
  const session = await auth();
  const { unannotatedPages, annotatedPages } = await fetchImagePages();

  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-4 sm:p-8">
      <header className="w-full max-w-7xl flex justify-between items-center mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">
          Welcome, {session?.user?.email}
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-right text-sm">
            {session?.user?.email}
          </span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="w-full max-w-7xl flex flex-col gap-12">
        <ImageGalleries 
          unannotatedPages={unannotatedPages}
          annotatedPages={annotatedPages}
        />
      </main>
    </div>
  );
}