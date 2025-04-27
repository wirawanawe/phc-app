require("dotenv").config({ path: ".env.local" });
const { Sequelize } = require("sequelize");

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "pr1k1t1w";

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "mysql",
  dialectModule: require("mysql2"),
  logging: console.log,
});

async function removeTaskDueDate() {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection successful!");

    console.log("Removing dueDate column from tasks table...");

    // Remove the dueDate column
    try {
      await sequelize.query(`
        ALTER TABLE tasks 
        DROP COLUMN dueDate
      `);
      console.log("Successfully removed dueDate column from tasks table");
    } catch (err) {
      console.error("Error removing dueDate column:", err);
      return;
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

// Run the migration
removeTaskDueDate();
