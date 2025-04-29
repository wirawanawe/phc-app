/**
 * Script to run database migrations
 */
require("dotenv").config({ path: ".env.local" });
const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "mysql",
  dialectModule: require("mysql2"),
  logging: console.log,
});

async function runMigrations() {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection successful!");

    console.log("Running migrations...");

    // Migration: Add timePerformed to tasks table if it doesn't exist
    try {
      // Check if tasks table has timePerformed column
      const [timePerformedResult] = await sequelize.query(`
        SHOW COLUMNS FROM tasks LIKE 'timePerformed'
      `);

      if (timePerformedResult.length === 0) {
        // Add timePerformed column if it doesn't exist
        await sequelize.query(`
          ALTER TABLE tasks 
          ADD COLUMN timePerformed TIME NULL
        `);
        console.log("Added 'timePerformed' column to tasks table");
      } else {
        console.log("timePerformed column already exists in tasks table");
      }
    } catch (err) {
      console.error("Error adding timePerformed to tasks:", err);
    }

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
