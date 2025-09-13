// src/app/ui/image-galleries.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ImageForAnnotation } from '@/app/lib/definitions';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface ImageGalleriesProps {
  unannotatedPages: number;
  annotatedPages: number;
}

export default function ImageGalleries({ unannotatedPages, annotatedPages }: ImageGalleriesProps) {
  const [activeTab, setActiveTab] = useState<'unannotated' | 'annotated'>('unannotated');
  const [images, setImages] = useState<ImageForAnnotation[]>([]);
  const [totalPages, setTotalPages] = useState(unannotatedPages);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    async function loadImages() {
      setIsLoading(true);
      const response = await fetch(`/api/images?type=${activeTab}&page=${currentPage}`);
      const fetchedImages = await response.json();
      
      setImages(fetchedImages);
      setTotalPages(activeTab === 'unannotated' ? unannotatedPages : annotatedPages);
      setIsLoading(false);
    }
    loadImages();
  }, [activeTab, currentPage, unannotatedPages, annotatedPages]);

  const handleTabChange = (tab: 'unannotated' | 'annotated') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex border-b mb-4">
        <button
          onClick={() => handleTabChange('unannotated')}
          className={`py-2 px-4 font-semibold ${activeTab === 'unannotated' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Unannotated
        </button>
        <button
          onClick={() => handleTabChange('annotated')}
          className={`py-2 px-4 font-semibold ${activeTab === 'annotated' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Annotated
        </button>
      </div>

      <div>
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading images...</div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image) => (
              <Link key={image.id} href={`/annotate/${image.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative w-full aspect-square">
                  <Image src={image.imageUrl} alt={image.imageName} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs truncate font-mono" title={image.imageName}>{image.imageName}</p>
                   {activeTab === 'unannotated' ? (
                     <p className="text-sm font-semibold">Model says: {image.modelStatus}</p>
                   ) : (
                     <p className="text-sm font-semibold text-green-600">Completed</p>
                   )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No images in this section.</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center items-center gap-4">
        {/* STYLING FIX: Added explicit text colors */}
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}