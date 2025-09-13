// src/app/annotate/[id]/page.tsx

import { fetchImageForAnnotation } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AnnotationForm from '@/app/ui/annotation-form';
import Logo from '@/app/ui/logo';

// Define a specific type for the page's props
interface AnnotationPageProps {
  params: { id: string };
}

export default async function AnnotationPage({ params }: AnnotationPageProps) { // <-- Use the new type here
  const id = Number(params.id);
  const data = await fetchImageForAnnotation(id);

  if (!data) {
    notFound();
  }

  const { image, nextId } = data;

  return (
    <div className="flex flex-col h-screen">
        <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 flex justify-start">
            <Logo size={50} />
        </header>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <div className="w-full md:w-3/4 p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
                <Image
                    src={image.imageUrl}
                    alt={image.imageName}
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="100vw"
                />
            </div>

            <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 shadow-lg overflow-y-auto">
                <h1 className="text-2xl font-bold mb-2">Annotation</h1>
                <p className="text-sm text-gray-500 mb-6 font-mono break-words">{image.imageName}</p>

                <AnnotationForm image={image} nextId={nextId} />

                <div className="mt-8">
                <Link href="/home" className="text-blue-500 hover:underline">
                    &larr; Back to Dashboard
                </Link>
                </div>
            </div>
        </div>
    </div>
  );
}