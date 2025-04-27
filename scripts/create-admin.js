require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function createAdminUser() {
  let connection;

  try {
    console.log("Connecting to database...");

    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "phc_db",
    };

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to MySQL database: ${dbConfig.database}`);

    // Check if any users exist
    const [userRows] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const userCount = userRows[0].count;

    if (userCount === 0) {
      console.log("No users found. Creating default admin user...");

      // Generate hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      // Generate UUID for user ID
      const uuid = require("uuid").v4();

      // Insert admin user
      await connection.query(
        `INSERT INTO users (id, username, email, fullName, password, role, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          uuid,
          "admin",
          "admin@example.com",
          "System Administrator",
          hashedPassword,
          "admin",
          true,
        ]
      );

      console.log("Created default admin user with ID:", uuid);
      console.log("Username: admin");
      console.log("Password: admin123");
      console.log("Please change the password after login!");
    } else {
      console.log(
        `Found ${userCount} users in the database. No action needed.`
      );
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the function
createAdminUser();
