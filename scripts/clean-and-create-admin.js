/**
 * Script to clean the users table and create a fresh admin user
 *
 * Run with: node scripts/clean-and-create-admin.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const readline = require("readline");

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function cleanAndCreateAdmin() {
  let connection;
  try {
    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "phc_db",
      multipleStatements: true,
    };

    console.log(
      `Connecting to MySQL database: ${dbConfig.database} as ${dbConfig.user}...`
    );
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected successfully to database");

    // Check if users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log(
        "Users table does not exist. Please run database setup first."
      );
      rl.close();
      return;
    }

    // Count existing users
    const [userRows] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    console.log(`Found ${userRows[0].count} users in the database.`);

    // Ask for confirmation and wait for the answer
    const answer = await new Promise((resolve) => {
      rl.question(
        '⚠️ WARNING: This will delete ALL existing users and create a new admin user.\nContinue? (type "YES" to confirm): ',
        (ans) => {
          resolve(ans);
        }
      );
    });

    if (answer.toUpperCase() !== "YES") {
      console.log("Operation cancelled.");
      rl.close();
      await connection.end();
      return;
    }

    // Delete all users
    console.log("Deleting all users...");
    await connection.query("DELETE FROM users");
    console.log("All users have been deleted successfully.");

    // Create new admin user
    console.log("Creating new admin user...");
    const adminId = uuidv4();

    // Use bcrypt to hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Insert admin user
    await connection.query(
      `INSERT INTO users (id, username, email, fullName, password, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        adminId,
        "admin",
        "admin@example.com",
        "System Administrator",
        hashedPassword,
        "admin",
        true,
      ]
    );

    console.log("✅ New admin user created successfully!");
    console.log("----------------------------------");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("----------------------------------");
    console.log("Please change this password after logging in!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
    rl.close();
  }
}

// Run the function
cleanAndCreateAdmin();
