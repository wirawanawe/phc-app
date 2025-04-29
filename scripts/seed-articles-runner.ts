/**
 * This script runs the article seeder to populate the database with dummy health articles
 */

import runArticleSeeder from "../app/seed/articles";

async function main() {
  console.log("Starting article seeder...");
  try {
    const success = await runArticleSeeder();
    if (success) {
      console.log("Article seeding completed successfully");
      process.exit(0);
    } else {
      console.error("Article seeding failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error running article seeder:", error);
    process.exit(1);
  }
}

main();
