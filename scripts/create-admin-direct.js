/**
 * Create Admin User Script
 * This script creates an admin user in the database if no users exist.
 *
 * Run with: node scripts/create-admin-direct.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

async function createAdminUser() {
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

    // Check if any users exist
    const [userRows] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    if (userRows[0].count > 0) {
      console.log(
        `Found ${userRows[0].count} users in the database. No action needed.`
      );
      return;
    }

    console.log("No users found. Creating admin user...");

    // Generate new UUID
    const adminId = uuidv4();

    // Hash the password using bcrypt (or use a predefined hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    // Alternative: use the same password as in db-setup.js
    // const hashedPassword = "$2a$10$MQ7v4hQzUQOvS4QBP36cH.jBhxOr0cm7Y0k3QI9MiL2kP.xD3/112"; // "password"

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

    console.log("✅ Admin user created successfully!");
    console.log("----------------------------------");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("----------------------------------");
    console.log("Please change this password after logging in!");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the function
createAdminUser();
