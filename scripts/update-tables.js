require("dotenv").config({ path: ".env.local" });
const path = require("path");

// Set up module aliases
require("module-alias").addAliases({
  "@": path.join(__dirname, ".."),
});

const { initializeDatabase } = require("@/app/models");

async function updateTables() {
  try {
    console.log("Starting database tables update...");
    await initializeDatabase();
    console.log("Database tables updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database update:", error);
    process.exit(1);
  }
}

updateTables();
