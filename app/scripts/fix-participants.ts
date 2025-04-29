import { sequelize } from "../models";
import { runMigrations } from "../config/migrations";
import syncParticipantsData from "./sync-participants";

/**
 * This script fixes participant data issues by:
 * 1. Running migrations to fix foreign key constraints
 * 2. Synchronizing participant data
 */
async function fixParticipantsIssues() {
  try {
    console.log("Starting participant fix process...");

    // 1. Run migrations to fix foreign key constraints
    console.log("Step 1: Running migrations to fix foreign key constraints...");
    await runMigrations();

    // 2. Synchronize participant data
    console.log("Step 2: Synchronizing participant data...");
    await syncParticipantsData();

    console.log("Participant fix process completed successfully!");
  } catch (error) {
    console.error("Error fixing participant issues:", error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the script when executed directly
if (require.main === module) {
  fixParticipantsIssues()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export default fixParticipantsIssues;
