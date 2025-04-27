/**
 * Script untuk mereset database (menghapus dan membuat ulang semua tabel)
 *
 * Menjalankan:
 * node scripts/reset-db.js
 */

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const readline = require("readline");
const { initializeDatabase, resetDatabase } = require("../app/models");

// Buat interface readline untuk konfirmasi
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetDatabase() {
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

    console.log(
      "PERINGATAN: Semua data akan dihapus dan tabel akan dibuat ulang."
    );
    console.log("Anda akan kehilangan semua data yang telah dimasukkan.");

    // Tampilkan daftar tabel yang ada
    const [tables] = await connection.query("SHOW TABLES");
    if (tables.length > 0) {
      console.log("\nTabel yang akan dihapus:");
      const tableList = tables.map((row) => Object.values(row)[0]);
      tableList.forEach((table) => console.log(`- ${table}`));
    } else {
      console.log("Tidak ada tabel yang ditemukan untuk dihapus.");
    }

    return new Promise((resolve) => {
      rl.question(
        '\nApakah Anda yakin ingin melanjutkan? (ketik "YES" untuk konfirmasi): ',
        async (answer) => {
          if (answer.toUpperCase() === "YES") {
            try {
              // Matikan foreign key checks untuk memudahkan drop tables
              await connection.query("SET FOREIGN_KEY_CHECKS = 0");

              // Drop semua tabel jika ada
              if (tables.length > 0) {
                const tableList = tables.map((row) => Object.values(row)[0]);
                for (const table of tableList) {
                  console.log(`Dropping table: ${table}`);
                  await connection.query(`DROP TABLE IF EXISTS ${table}`);
                }
              }

              // Aktifkan kembali foreign key checks
              await connection.query("SET FOREIGN_KEY_CHECKS = 1");

              console.log(
                "\nDatabase berhasil direset! Semua tabel telah dihapus."
              );
              console.log(
                'Jalankan "npm run db:setup" untuk membuat tabel dan data awal baru.'
              );

              resolve(true);
            } catch (error) {
              console.error("Error saat mereset database:", error);
              resolve(false);
            }
          } else {
            console.log("Reset database dibatalkan.");
            resolve(false);
          }
          rl.close();
        }
      );
    });
  } catch (error) {
    console.error("Error saat menghubungkan ke database:", error);
    rl.close();
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

const runReset = async () => {
  console.log("Starting database reset...");
  try {
    await resetDatabase();
    console.log("Database has been reset successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database reset:", error);
    process.exit(1);
  }
};

runReset();
