// src/app/ui/logo.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ size = 150 }: { size?: number }) {
  return (
    <Link href="/home" className="flex items-center text-white">
      <Image
        src="/logo.png" // <-- Updated to .png
        width={size}
        height={size}
        alt="Vector-Loaded Application Logo"
        // The 'rounded-full' class has been removed
      />
    </Link>
  );
}