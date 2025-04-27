require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

// Database configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";

async function updateDatabase() {
  let connection;
  try {
    console.log("Connecting to database...");

    // Create connection
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    console.log("Connected to database successfully");

    // Execute ALTER TABLE to modify the Insurance table
    console.log("Updating Insurance table structure...");

    // Check if the price column exists first
    const [columns] = await connection.query(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'Insurances' 
      AND COLUMN_NAME = 'price'
    `,
      [DB_NAME]
    );

    if (columns.length > 0) {
      // The price column exists, drop it
      await connection.query(`
        ALTER TABLE Insurances
        DROP COLUMN price
      `);
      console.log("Removed 'price' column from Insurances table");
    } else {
      console.log("The 'price' column does not exist, no changes needed");
    }

    console.log("Database structure updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating database:", error);
    return false;
  } finally {
    if (connection) {
      console.log("Closing database connection");
      await connection.end();
    }
  }
}

// Run the update
updateDatabase()
  .then((success) => {
    if (success) {
      console.log("Database update completed successfully");
      process.exit(0);
    } else {
      console.error("Database update failed");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
