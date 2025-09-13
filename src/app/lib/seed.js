// src/app/lib/seed.js

// --- ADD THESE TWO LINES AT THE TOP ---
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
// ------------------------------------

const { db } = require('@vercel/postgres');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

async function seedImages(client) {
  try {
    // Create the "images" table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        "imageName" VARCHAR(255) UNIQUE NOT NULL,
        "imageUrl" VARCHAR(255) NOT NULL,
        "modelStatus" VARCHAR(50) NOT NULL
      );
    `;
    console.log(`Created "images" table`);

    // Read the CSV file
    const csvPath = path.join(__dirname, 'final_results_with_urls.csv');
    const fileContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });

    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`Read ${records.length} records from CSV.`);

    // Insert data into the "images" table
    const insertedImages = await Promise.all(
      records.map(async (image) => {
        return client.sql`
          INSERT INTO images ("imageName", "imageUrl", "modelStatus")
          VALUES (${image.imageName}, ${image.imageUrl}, ${image.modelStatus})
          ON CONFLICT ("imageName") DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedImages.length} images.`);

  } catch (error) {
    console.error('Error seeding images:', error);
    throw error;
  }
}


async function main() {
  const client = await db.connect();
  
  await seedImages(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});