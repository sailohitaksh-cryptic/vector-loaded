// src/app/ui/image-viewer.tsx

'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';

interface ImageViewerProps {
  src: string;
  alt: string;
}

export default function ImageViewer({ src, alt }: ImageViewerProps) {
  return (
    <Zoom>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        quality={100}
        sizes="(max-width: 768px) 100vw, 66vw"
      />
    </Zoom>
  );
}