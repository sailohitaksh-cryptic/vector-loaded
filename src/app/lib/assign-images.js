// src/app/lib/assign-images.js

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { db } = require('@vercel/postgres');

async function assignImages() {
  const client = await db.connect();
  try {
    console.log('Fetching data from the database...');
    const imagesResult = await client.sql`SELECT id FROM images;`;
    const allImages = imagesResult.rows;

    const vcosResult = await client.sql`SELECT id FROM users WHERE role = 'vco';`;
    const vcos = vcosResult.rows.map(u => u.id);

    const studentsResult = await client.sql`SELECT id FROM users WHERE role = 'student';`;
    const students = studentsResult.rows.map(u => u.id);

    if (vcos.length === 0 || students.length === 0) {
      console.error("Error: You must have at least one VCO and one Student in the database.");
      return;
    }

    console.log(`Found ${allImages.length} images, ${vcos.length} VCOs, and ${students.length} students.`);

    let assignments = [];
    let vcoIndex = 0;
    let studentIndex = 0;

    for (const image of allImages) {
      // Assign one VCO
      const vcoId = vcos[vcoIndex % vcos.length];
      assignments.push({ imageId: image.id, userId: vcoId });
      vcoIndex++;

      // Assign one Student
      const studentId = students[studentIndex % students.length];
      assignments.push({ imageId: image.id, userId: studentId });
      studentIndex++;
    }

    console.log(`Generated ${assignments.length} assignments. Inserting into database...`);

    // Insert all assignments
    for (const assignment of assignments) {
      await client.sql`
        INSERT INTO image_assignments ("imageId", "userId")
        VALUES (${assignment.imageId}, ${assignment.userId})
        ON CONFLICT ("imageId", "userId") DO NOTHING;
      `;
    }

    console.log("✅ Successfully created and inserted all image assignments.");

  } catch (error) {
    console.error("Error during image assignment:", error);
  } finally {
    await client.end();
  }
}

assignImages();