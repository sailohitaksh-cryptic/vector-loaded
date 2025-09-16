// src/app/annotate/[id]/page.tsx

import { fetchImageForAnnotation } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AnnotationForm from '@/app/ui/annotation-form';
import Logo from '@/app/ui/logo';

export default async function AnnotationPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await fetchImageForAnnotation(id);

  if (!data) {
    notFound();
  }

  const { image, nextId } = data;

  return (
    // On mobile, the entire page scrolls. On desktop, only the form scrolls.
    <div className="flex flex-col h-screen md:overflow-hidden">
        <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0 z-10">
            <Logo size={50} />
        </header>

        <div className="flex flex-col md:flex-row flex-grow md:overflow-hidden">
            
            {/* Image Panel */}
            <div className="w-full md:w-2/3 p-1 flex items-center justify-center bg-gray-900 flex-shrink-0 md:h-full md:overflow-y-auto">
                {/* On mobile, this container will create a large viewing area */}
                <div className="relative w-full aspect-square md:aspect-auto md:min-h-full">
                    <Image
                        src={image.imageUrl}
                        alt={image.imageName}
                        fill
                        className="object-contain"
                        quality={100}
                        sizes="(max-width: 768px) 100vw, 66vw"
                    />
                </div>
            </div>

            {/* Annotation Panel */}
            <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 shadow-lg md:overflow-y-auto">
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
