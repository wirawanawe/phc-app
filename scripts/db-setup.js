/**
 * Script untuk setup database dan memasukkan data awal
 *
 * Menjalankan:
 * node scripts/db-setup.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");

async function setupDatabase() {
  let connection;
  try {
    // Koneksi ke database
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "phc_db",
      multipleStatements: true,
    };

    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to MySQL database: ${dbConfig.database}`);

    // Buat tabel users
    console.log("Creating users table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        fullName VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'staff', 'doctor') NOT NULL DEFAULT 'staff',
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        lastLogin DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Buat tabel doctors
    console.log("Creating doctors table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        schedule TEXT COMMENT 'JSON string containing the doctor\'s practice schedule',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Buat tabel participants
    console.log("Creating participants table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        dateOfBirth DATE,
        address TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Buat tabel appointments
    console.log("Creating appointments table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        participantId VARCHAR(36) NOT NULL,
        doctorId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        time TIME,
        status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE,
        FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);

    // Buat tabel health_programs
    console.log("Creating health_programs table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS health_programs (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE,
        location VARCHAR(100),
        maxParticipants INT,
        status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Cek apakah perlu memasukkan data awal
    const [userRows] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    if (userRows[0].count === 0) {
      console.log("Inserting initial data...");

      // Tambahkan user admin
      const adminId = uuidv4();
      await connection.query(
        `
        INSERT INTO users (id, username, email, fullName, password, role, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          adminId,
          "admin",
          "admin@example.com",
          "System Administrator",
          "$2a$10$MQ7v4hQzUQOvS4QBP36cH.jBhxOr0cm7Y0k3QI9MiL2kP.xD3/112", // "password"
          "admin",
          true,
        ]
      );

      // Tambahkan dokter contoh
      const doctorId = uuidv4();
      await connection.query(
        `
        INSERT INTO doctors (id, name, specialization, email, phone)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          doctorId,
          "Dr. Jane Smith",
          "Cardiologist",
          "jane.smith@example.com",
          "123-456-7890",
        ]
      );

      // Tambahkan peserta contoh
      const participantId = uuidv4();
      await connection.query(
        `
        INSERT INTO participants (id, name, email, phone, dateOfBirth, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          participantId,
          "John Doe",
          "john.doe@example.com",
          "123-456-7891",
          "1980-01-01",
          "123 Main St, New York, NY 10001",
        ]
      );

      // Tambahkan janji temu contoh
      const appointmentId = uuidv4();
      await connection.query(
        `
        INSERT INTO appointments (id, participantId, doctorId, date, time, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          appointmentId,
          participantId,
          doctorId,
          "2023-12-15",
          "10:00:00",
          "scheduled",
          "Initial consultation",
        ]
      );

      // Tambahkan program kesehatan contoh
      const programId = uuidv4();
      await connection.query(
        `
        INSERT INTO health_programs (id, name, description, startDate, endDate, location, maxParticipants, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          programId,
          "Weight Management Program",
          "A 12-week program to help participants manage their weight through diet and exercise.",
          "2023-12-01",
          "2024-02-28",
          "Health Center Main Building",
          30,
          "active",
        ]
      );

      console.log("Initial data inserted successfully!");
    } else {
      console.log(
        "Database already contains data. Skipping initial data insertion."
      );
    }

    console.log("Database setup completed successfully!");
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Jalankan fungsi setup
setupDatabase()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
