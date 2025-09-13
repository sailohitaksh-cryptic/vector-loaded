// src/app/api/images/route.ts

import { fetchImagesForUser } from '@/app/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'unannotated' | 'annotated' | null;
  const page = searchParams.get('page');
  
  if (!type || !page) {
    return NextResponse.json(
      { error: 'Missing type or page parameters' },
      { status: 400 },
    );
  }

  try {
    const images = await fetchImagesForUser(type, Number(page));
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 },
    );
  }
}