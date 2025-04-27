/**
 * Script to update task status field
 */
require("dotenv").config({ path: ".env.local" });
const { Sequelize } = require("sequelize");

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

async function updateTaskStatus() {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection successful!");

    console.log("Updating task status field...");

    // Step 1: Add the new values to the ENUM
    try {
      await sequelize.query(`
        ALTER TABLE tasks 
        MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'cancelled', 'active', 'inactive') NOT NULL DEFAULT 'active'
      `);
      console.log("Added new values to status ENUM");
    } catch (err) {
      console.error("Error adding new values to status ENUM:", err);
      return;
    }

    // Step 2: Map existing statuses to new statuses
    try {
      await sequelize.query(`
        UPDATE tasks 
        SET status = 'active' 
        WHERE status IN ('pending', 'in_progress', 'completed')
      `);
      console.log("Updated active statuses");

      await sequelize.query(`
        UPDATE tasks 
        SET status = 'inactive' 
        WHERE status = 'cancelled'
      `);
      console.log("Updated inactive statuses");
    } catch (err) {
      console.error("Error updating status values:", err);
      return;
    }

    // Step 3: Remove old values from ENUM
    try {
      await sequelize.query(`
        ALTER TABLE tasks 
        MODIFY COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
      `);
      console.log("Successfully modified status column to final ENUM values");
    } catch (err) {
      console.error("Error finalizing status column:", err);
    }

    console.log("Task status update completed");
  } catch (error) {
    console.error("Error updating task status:", error);
  } finally {
    await sequelize.close();
  }
}

updateTaskStatus();
