import { sql } from '@vercel/postgres';
import { auth } from '@/../auth';
import type { ImageForAnnotation, User } from './definitions';

const IMAGES_PER_PAGE = 50;

export async function fetchImagePages() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { unannotatedPages: 0, annotatedPages: 0 };

  try {
    const unannotatedCount = await sql`
      SELECT COUNT(*)
      FROM images i
      LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${Number(userId)}
      WHERE a.id IS NULL
    `;
    const annotatedCount = await sql`SELECT COUNT(*) FROM annotations WHERE "userId" = ${Number(userId)}`;

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
        LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${Number(userId)}
        WHERE a.id IS NULL
        -- THE FIX: Order randomly based on a combination of image ID and user ID
        ORDER BY md5(i.id::text || ${userId})
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
        WHERE a."userId" = ${Number(userId)}
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
        const imageResult = await sql<ImageForAnnotation>`SELECT * FROM images WHERE id = ${id}`;
        const image = imageResult.rows[0];

        if (!image) return null;

        // Fetch the ID of the next unannotated image in the user's random sequence
        const nextImageResult = await sql`
            SELECT i.id FROM images i
            LEFT JOIN annotations a ON i.id = a."imageId" AND a."userId" = ${Number(userId)}
            WHERE a.id IS NULL
            ORDER BY md5(i.id::text || ${userId})
        `;
        
        const allUnannotatedIds = nextImageResult.rows.map(r => r.id);
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
