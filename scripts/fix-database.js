/**
 * Script to fix database schema issues
 */

// Import the Sequelize library and dotenv
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config({ path: ".env.local" });

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "pr1k1t1w";

// Create database connection
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: "mysql",
  dialectModule: require("mysql2"), // Explicitly provide the mysql2 module
  logging: console.log,
});

async function fixDatabase() {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection successful!");

    console.log("Checking for the participants table...");
    // Check if table exists
    try {
      const [tables] = await sequelize.query('SHOW TABLES LIKE "participants"');

      if (tables.length === 0) {
        console.error("Participants table not found!");
        return;
      }

      console.log("Participants table exists.");

      // Check if identityNumber column exists
      const [identityColumn] = await sequelize.query(`
        SHOW COLUMNS FROM participants LIKE 'identityNumber'
      `);

      if (identityColumn.length === 0) {
        console.log("Adding identityNumber column...");
        await sequelize.query(`
          ALTER TABLE participants 
          ADD COLUMN identityNumber VARCHAR(50) NULL
        `);
        console.log("Successfully added identityNumber column!");
      } else {
        console.log("identityNumber column already exists.");
      }

      // Check if insuranceId column exists
      const [insuranceIdColumn] = await sequelize.query(`
        SHOW COLUMNS FROM participants LIKE 'insuranceId'
      `);

      if (insuranceIdColumn.length === 0) {
        console.log("Adding insuranceId column...");
        await sequelize.query(`
          ALTER TABLE participants 
          ADD COLUMN insuranceId VARCHAR(36) NULL
        `);
        console.log("Successfully added insuranceId column!");
      } else {
        console.log("insuranceId column already exists.");
      }

      // Check if insuranceNumber column exists
      const [insuranceNumberColumn] = await sequelize.query(`
        SHOW COLUMNS FROM participants LIKE 'insuranceNumber'
      `);

      if (insuranceNumberColumn.length === 0) {
        console.log("Adding insuranceNumber column...");
        await sequelize.query(`
          ALTER TABLE participants 
          ADD COLUMN insuranceNumber VARCHAR(50) NULL
        `);
        console.log("Successfully added insuranceNumber column!");
      } else {
        console.log("insuranceNumber column already exists.");
      }
    } catch (tableError) {
      console.error("Error checking/modifying participants table:", tableError);
    }

    console.log("Database schema fixed successfully!");
  } catch (error) {
    console.error("Error fixing database:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

console.log("Starting database fix...");
fixDatabase();
