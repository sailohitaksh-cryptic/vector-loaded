// src/app/lib/assign-images.js

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { db } = require('@vercel/postgres');

async function assignImages() {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`; // Start a database transaction

    console.log('Fetching data from the database...');
    // Get all images
    const imagesResult = await client.sql`SELECT id FROM images;`;
    const allImages = imagesResult.rows;

    // Get specific user groups
    const vcosResult = await client.sql`SELECT id FROM users WHERE role = 'vco' ORDER BY id LIMIT 5;`;
    const vcos = vcosResult.rows.map(u => u.id);

    const studentsResult = await client.sql`SELECT id FROM users WHERE role = 'student' ORDER BY id LIMIT 7;`;
    const students = studentsResult.rows.map(u => u.id);

    const specificUserId = 12;

    // --- Verification ---
    if (allImages.length === 0) throw new Error("No images found in the database.");
    console.log(`Found ${allImages.length} images, ${vcos.length} VCOs, and ${students.length} students.`);

    // --- Clear Old Assignments ---
    await client.sql`TRUNCATE TABLE image_assignments RESTART IDENTITY;`;
    console.log('Cleared all previous assignments.');

    // --- Assignment Logic ---
    let assignments = new Set();
    let vcoIndex = 0;
    let studentIndex = 0;

    for (const image of allImages) {
      // 1. Assign every image to User 12
      assignments.add(JSON.stringify({ imageId: image.id, userId: specificUserId }));

      // 2. Distribute among VCOs
      if (vcos.length > 0) {
        const vcoId = vcos[vcoIndex % vcos.length];
        assignments.add(JSON.stringify({ imageId: image.id, userId: vcoId }));
        vcoIndex++;
      }

      // 3. Distribute among Students
      if (students.length > 0) {
        const studentId = students[studentIndex % students.length];
        assignments.add(JSON.stringify({ imageId: image.id, userId: studentId }));
        studentIndex++;
      }
    }

    const finalAssignments = Array.from(assignments).map(item => JSON.parse(item));
    console.log(`Generated ${finalAssignments.length} unique assignments. Inserting into database...`);

    // --- Database Insertion ---
    for (const assignment of finalAssignments) {
      await client.sql`
        INSERT INTO image_assignments ("imageId", "userId")
        VALUES (${assignment.imageId}, ${assignment.userId});
      `;
    }
    console.log("✅ Successfully inserted all new assignments.");

    // --- Preserve Completed Status for User 12 ---
    console.log(`Checking for previously completed annotations for user ${specificUserId}...`);
    const completedResult = await client.sql`
        UPDATE image_assignments
        SET status = 'completed'
        WHERE "userId" = ${specificUserId}
        AND "imageId" IN (SELECT "imageId" FROM annotations WHERE "userId" = ${specificUserId});
    `;
    console.log(`✅ Marked ${completedResult.rowCount} existing annotations as 'completed' for user ${specificUserId}.`);

    await client.sql`COMMIT`; // Finalize the transaction

  } catch (error) {
    await client.sql`ROLLBACK`; // If anything fails, undo all changes
    console.error("❌ Error during image assignment:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

assignImages();