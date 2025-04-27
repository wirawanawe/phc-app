require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function addPasswordToUsers() {
  let connection;
  try {
    // Connect to database
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "phc_db",
    };

    console.log("Attempting to connect to database with config:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    });

    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to MySQL database: ${dbConfig.database}`);

    // Check if password column already exists
    console.log("Checking if password column exists...");
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users LIKE 'password'
    `);

    if (columns.length > 0) {
      console.log("✅ Password column already exists in users table!");
    } else {
      // Add password column to users table
      console.log("Adding password column to users table...");
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN password VARCHAR(100) NOT NULL DEFAULT '$2a$10$MQ7v4hQzUQOvS4QBP36cH.jBhxOr0cm7Y0k3QI9MiL2kP.xD3/112'
      `);
      console.log("✅ Successfully added password column to users table!");

      // The default password is 'password', hashed with bcrypt
      console.log("Password has been set to 'password' for all existing users");
    }
  } catch (error) {
    console.error("Error adding password column to users table:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the migration
addPasswordToUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
