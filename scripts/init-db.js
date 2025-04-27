/**
 * Script untuk menginisialisasi database MySQL
 *
 * Menjalankan:
 * node scripts/init-db.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function createDatabase() {
  try {
    // Koneksi ke MySQL tanpa memilih database tertentu
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
    });

    console.log("Connected to MySQL server");

    // Buat database jika belum ada
    const dbName = process.env.DB_NAME || "phc_db";
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database '${dbName}' created or already exists`);

    // Verifikasi database telah dibuat
    const [rows] = await connection.query("SHOW DATABASES LIKE ?", [dbName]);
    if (rows.length > 0) {
      console.log(`Successfully verified database '${dbName}' exists`);
    } else {
      throw new Error(`Failed to create database '${dbName}'`);
    }

    // Tutup koneksi
    await connection.end();
    console.log("Database initialization complete");

    console.log("\nNext steps:");
    console.log(
      '1. Run "npm run db:setup" to create tables and seed initial data'
    );
    console.log('2. Run "npm run dev" to start the application');

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}

// Jalankan fungsi inisialisasi
createDatabase()
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
