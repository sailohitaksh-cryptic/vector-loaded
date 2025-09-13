// src/app/lib/data.ts

import { sql } from '@vercel/postgres';
import { auth } from '@/../auth';
import type { ImageForAnnotation } from './definitions'; // We'll create this file

const IMAGES_PER_PAGE = 50;

export async function fetchImagePages() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { unannotatedPages: 0, annotatedPages: 0 };

  try {
    const unannotatedCount = await sql`
      SELECT COUNT(*)
      FROM images i
      LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${userId}
      WHERE a.id IS NULL
    `;
    const annotatedCount = await sql`SELECT COUNT(*) FROM annotations WHERE "userId" = ${userId}`;

    const unannotatedPages = Math.ceil(Number(unannotatedCount.rows[0].count) / IMAGES_PER_PAGE);
    const annotatedPages = Math.ceil(Number(annotatedCount.rows[0].count) / IMAGES_PER_PAGE);
    
    return { unannotatedPages, annotatedPages };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total page counts.');
  }
}

export async function fetchImagesForUser(
  type: 'unannotated' | 'annotated',
  currentPage: number,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const offset = (currentPage - 1) * IMAGES_PER_PAGE;

  try {
    if (type === 'unannotated') {
      const data = await sql<ImageForAnnotation>`
        SELECT
          i.id,
          i."imageName",
          i."imageUrl",
          i."modelStatus"
        FROM images i
        LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${userId}
        WHERE a.id IS NULL
        ORDER BY i.id
        LIMIT ${IMAGES_PER_PAGE} OFFSET ${offset}
      `;
      return data.rows;
    } else {
       const data = await sql<ImageForAnnotation>`
        SELECT
          i.id,
          i."imageName",
          i."imageUrl",
          i."modelStatus"
        FROM images i
        INNER JOIN annotations a ON i.id = a."imageId"
        WHERE a."userId" = ${userId}
        ORDER BY a."verifiedAt" DESC
        LIMIT ${IMAGES_PER_PAGE} OFFSET ${offset}
      `;
      return data.rows;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch images.');
  }
}

export async function fetchImageForAnnotation(id: number) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    try {
        // Fetch the target image
        const imageResult = await sql<ImageForAnnotation>`SELECT * FROM images WHERE id = ${id}`;
        const image = imageResult.rows[0];

        if (!image) return null;

        // Fetch the ID of the next unannotated image
        const nextImageResult = await sql`
            SELECT i.id FROM images i
            LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${userId}
            WHERE a.id IS NULL AND i.id > ${id}
            ORDER BY i.id ASC
            LIMIT 1
        `;
        const nextId = nextImageResult.rows[0]?.id || null;
        
        return { image, nextId };

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch image for annotation.');
    }
}