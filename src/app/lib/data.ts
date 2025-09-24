// src/app/lib/data.ts

import { sql } from '@vercel/postgres';
import { auth } from '@/../auth';
import type { ImageForAnnotation } from './definitions';

const IMAGES_PER_PAGE = 50;

export async function fetchImagePages() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { unannotatedPages: 0, annotatedPages: 0 };

  try {
    const unannotatedCount = await sql`SELECT COUNT(*) FROM image_assignments WHERE "userId" = ${Number(userId)} AND status = 'unannotated'`;
    const annotatedCount = await sql`SELECT COUNT(*) FROM image_assignments WHERE "userId" = ${Number(userId)} AND status = 'completed'`;

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
  const status = type === 'unannotated' ? 'unannotated' : 'completed';

  try {
    const data = await sql<ImageForAnnotation>`
      SELECT
        i.id,
        i."imageName",
        i."imageUrl",
        i."modelStatus"
      FROM images i
      JOIN image_assignments ia ON i.id = ia."imageId"
      WHERE ia."userId" = ${Number(userId)} AND ia.status = ${status}
      ORDER BY md5(i.id::text || ${userId})
      LIMIT ${IMAGES_PER_PAGE} OFFSET ${offset}
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch assigned images.');
  }
}

export async function fetchImageForAnnotation(id: number) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    try {
        // This query now joins the annotations table to get the user's previous work.
        const imageResult = await sql<ImageForAnnotation>`
            SELECT
                i.id,
                i."imageName",
                i."imageUrl",
                i."modelStatus",
                a."userStatus" -- Fetches the user's annotation if it exists
            FROM images i
            LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${Number(userId)}
            WHERE i.id = ${id}
        `;
        const image = imageResult.rows[0];
        if (!image) return null;

        // This logic to find the next image remains the same.
        const assignmentsResult = await sql`
            SELECT i.id FROM images i
            JOIN image_assignments ia ON i.id = ia."imageId"
            WHERE ia."userId" = ${Number(userId)} AND ia.status = 'unannotated'
            ORDER BY md5(i.id::text || ${userId})
        `;
        
        const allUnannotatedIds = assignmentsResult.rows.map(r => r.id as number);
        const currentIndex = allUnannotatedIds.findIndex(imgId => imgId === id);
        const nextId = currentIndex !== -1 && currentIndex < allUnannotatedIds.length - 1 
            ? allUnannotatedIds[currentIndex + 1] 
            : null;

        return { image, nextId };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch image for annotation.');
    }
}