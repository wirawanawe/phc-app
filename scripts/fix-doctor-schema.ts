import * as dotenv from "dotenv";
import { sequelize, initializeDatabase } from "../app/models";
import { QueryTypes } from "sequelize";

// Load environment variables
dotenv.config();

// Run the migration
(async () => {
  try {
    console.log("Starting doctor table schema check...");

    // Initialize database connection
    await initializeDatabase();
    console.log("Database connection established.");

    // Check if specialization column exists
    const checkSpecializationColumn = await sequelize.query(
      "SHOW COLUMNS FROM doctors LIKE 'specialization'",
      { type: QueryTypes.SELECT }
    );

    // Check if spesialization column exists
    const checkSpesializationColumn = await sequelize.query(
      "SHOW COLUMNS FROM doctors LIKE 'spesialization'",
      { type: QueryTypes.SELECT }
    );

    console.log("Column check results:", {
      specializationExists: checkSpecializationColumn.length > 0,
      spesializationExists: checkSpesializationColumn.length > 0,
    });

    // If specialization exists but spesialization doesn't, rename the column
    if (
      checkSpecializationColumn.length > 0 &&
      checkSpesializationColumn.length === 0
    ) {
      console.log(
        "Found 'specialization' column, but not 'spesialization'. Renaming column..."
      );
      await sequelize.query(
        "ALTER TABLE doctors CHANGE COLUMN specialization spesialization VARCHAR(100) NOT NULL"
      );
      console.log("Column renamed successfully.");
    }
    // If neither exists, create spesialization column
    else if (
      checkSpecializationColumn.length === 0 &&
      checkSpesializationColumn.length === 0
    ) {
      console.log(
        "Neither 'specialization' nor 'spesialization' column exists. Adding column..."
      );
      await sequelize.query(
        "ALTER TABLE doctors ADD COLUMN spesialization VARCHAR(100) NOT NULL DEFAULT 'General'"
      );
      console.log("Column added successfully.");
    }
    // Both columns exist (shouldn't happen but just in case)
    else if (
      checkSpecializationColumn.length > 0 &&
      checkSpesializationColumn.length > 0
    ) {
      console.log("Both columns exist. This is unusual.");

      // Get data from both columns
      const doctors = await sequelize.query(
        "SELECT id, specialization, spesialization FROM doctors",
        { type: QueryTypes.SELECT }
      );

      console.log("Current doctor data:", doctors);

      // Choose which one to keep based on data
      console.log("Please review your data and decide which column to keep.");
    } else {
      console.log(
        "The 'spesialization' column already exists. No changes needed."
      );
    }

    console.log("Doctor table schema check completed.");
    process.exit(0);
  } catch (error) {
    console.error("Schema check failed:", error);
    process.exit(1);
  }
})();
