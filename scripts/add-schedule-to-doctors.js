require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function addScheduleToDoctors() {
  let connection;
  try {
    // Connect to database
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "pr1k1t1w",
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

    // First check if schedule column already exists
    console.log("Checking if schedule column exists...");
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM doctors LIKE 'schedule'
    `);

    if (columns.length > 0) {
      console.log("✅ Schedule column already exists in doctors table!");
    } else {
      // Add schedule column to doctors table
      console.log("Adding schedule column to doctors table...");
      await connection.query(`
        ALTER TABLE doctors
        ADD COLUMN schedule TEXT COMMENT 'JSON string containing the doctor\\'s practice schedule'
      `);
      console.log("✅ Successfully added schedule column to doctors table!");
    }
  } catch (error) {
    console.error("Error adding schedule column to doctors table:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the migration
addScheduleToDoctors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
