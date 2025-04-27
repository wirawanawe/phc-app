/**
 * Script untuk memverifikasi koneksi database dan tabel
 *
 * Menjalankan:
 * node scripts/verify-db.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function verifyDatabase() {
  try {
    // Koneksi ke MySQL dengan database yang dipilih
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "phc_db",
    };

    // Buat koneksi ke database
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to MySQL database: ${dbConfig.database}`);

    // Verifikasi tabel yang ada
    const [tables] = await connection.query("SHOW TABLES");
    console.log("\nDatabase tables:");
    if (tables.length === 0) {
      console.log(
        'No tables found in the database. Run "npm run db:setup" to create tables.'
      );
    } else {
      const tableList = tables.map((row) => Object.values(row)[0]);
      tableList.forEach((table) => console.log(`- ${table}`));

      // Periksa setiap tabel untuk melihat jumlah baris
      console.log("\nTable statistics:");
      for (const table of tableList) {
        const [countResult] = await connection.query(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        const rowCount = countResult[0].count;
        console.log(`- ${table}: ${rowCount} row(s)`);
      }
    }

    // Tutup koneksi
    await connection.end();
    console.log("\nDatabase verification complete");
    return true;
  } catch (error) {
    console.error("Error verifying database:", error);
    return false;
  }
}

// Jalankan fungsi verifikasi
verifyDatabase()
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
