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
    // The main container allows vertical scrolling on mobile if content overflows
    <div className="flex flex-col h-screen">
        <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 flex-shrink-0 z-10">
            <Logo size={50} />
        </header>

        {/* This container switches from column (mobile) to row (desktop) */}
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            
            {/* Image Panel */}
            <div className="w-full md:w-2/3 p-4 flex items-center justify-center bg-gray-900 relative flex-shrink-0">
                {/* On mobile, this container takes full width and has a 16:9 aspect ratio */}
                <div className="w-full aspect-video md:aspect-auto md:h-full relative">
                    <Image
                        src={image.imageUrl}
                        alt={image.imageName}
                        fill
                        className="object-contain" // Ensures image is not cropped
                        quality={100}
                        sizes="(max-width: 768px) 100vw, 66vw"
                    />
                </div>
            </div>

            {/* Annotation Panel */}
            <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 shadow-lg overflow-y-auto">
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
