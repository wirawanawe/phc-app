const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "pr1k1t1w";

async function seedPrograms() {
  let connection;

  try {
    console.log("Connecting to database...");
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true, // Important for running multiple SQL statements
    });

    console.log("Connected to database successfully.");

    // Read SQL file
    const sqlFilePath = path.join(__dirname, "seed-health-programs.sql");
    const sqlScript = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Executing SQL script to seed health programs and tasks...");

    // Execute SQL script
    await connection.query(sqlScript);

    console.log("Successfully added 6 health programs with their tasks!");

    // Verify data was inserted
    const [healthPrograms] = await connection.query(
      "SELECT COUNT(*) as count FROM health_programs"
    );
    const [tasks] = await connection.query(
      "SELECT COUNT(*) as count FROM tasks"
    );

    console.log(
      `Total health programs in database: ${healthPrograms[0].count}`
    );
    console.log(`Total tasks in database: ${tasks[0].count}`);
  } catch (error) {
    console.error("Error seeding health programs:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
}

// Run the seed function
seedPrograms().catch(console.error);
