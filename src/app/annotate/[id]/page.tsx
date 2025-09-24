// src/app/annotate/[id]/page.tsx

import { fetchImageForAnnotation } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AnnotationForm from '@/app/ui/annotation-form';
import Logo from '@/app/ui/logo';
import ImageViewer from '@/app/ui/image-viewer';

export default async function AnnotationPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await fetchImageForAnnotation(id);

  if (!data) {
    notFound();
  }

  // Destructure the new prevId and nextId
  const { image, prevId, nextId } = data;

  return (
    <div className="flex flex-col h-screen">
        <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0 z-10">
            <Logo size={50} />
        </header>
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <div className="w-full md:w-2/3 p-4 flex items-center justify-center bg-gray-900 relative flex-shrink-0 md:h-full">
                <div className="relative w-full min-h-[50vh] md:h-full">
                    <ImageViewer src={image.imageUrl} alt={image.imageName} />
                </div>
            </div>
            <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 shadow-lg overflow-y-auto">
                <h1 className="text-2xl font-bold mb-2">Annotation</h1>
                <p className="text-sm text-gray-500 mb-6 font-mono break-words">{image.imageName}</p>
                {/* Pass the new props to the form */}
                <AnnotationForm image={image} prevId={prevId} nextId={nextId} />
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