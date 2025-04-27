// Script to fix the doctors table schema
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("Starting doctor table schema fix script...");

// Define the SQL to execute
const sqlCommands = `
-- Check if the specialization column exists
SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'doctors' AND COLUMN_NAME = 'specialization';

-- If it exists, we'll rename it to match our model field name
-- Note: This might fail if the column doesn't exist, which is fine
ALTER TABLE doctors CHANGE COLUMN specialization specialization VARCHAR(100) NOT NULL;

-- Add a log message
SELECT 'Schema update complete' as message;
`;

// Write the SQL to a temporary file
const sqlFilePath = path.join(__dirname, "fix-schema.sql");
fs.writeFileSync(sqlFilePath, sqlCommands);

try {
  // Execute the SQL script
  console.log("Executing SQL commands...");

  // Use environment variables for database connection - make sure these are set
  const dbHost = process.env.DATABASE_HOST || "localhost";
  const dbUser = process.env.DATABASE_USERNAME || "root";
  const dbPassword = process.env.DATABASE_PASSWORD || "";
  const dbName = process.env.DATABASE_NAME || "phc_app";

  // Construct the mysql command - adjust as needed for your environment
  const command = `mysql -h ${dbHost} -u ${dbUser} ${
    dbPassword ? `-p${dbPassword}` : ""
  } ${dbName} < ${sqlFilePath}`;

  // Execute the command
  execSync(command, { stdio: "inherit" });

  console.log("Schema update completed successfully.");
} catch (error) {
  console.error("Error executing SQL commands:", error.message);
} finally {
  // Clean up the temporary file
  fs.unlinkSync(sqlFilePath);
  console.log("Temporary SQL file removed.");
}

console.log("Doctor table schema fix script finished.");
