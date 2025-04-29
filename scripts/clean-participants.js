require("dotenv").config();
const mysql = require("mysql2/promise");

// Buat koneksi database dari environment variables
async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "phc_db",
  });
}

async function deleteAllParticipants() {
  let connection;

  try {
    console.log("Membuat koneksi ke database...");
    connection = await createConnection();

    console.log("Mencari semua tabel dengan foreign key ke participants...");
    const [referencingTables] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME = 'participants'
      AND REFERENCED_COLUMN_NAME = 'id'
      AND TABLE_SCHEMA = DATABASE()
    `);

    console.log(
      `Ditemukan ${referencingTables.length} tabel yang referensi ke participants table`
    );

    // Menonaktifkan foreign key checks
    console.log("Menonaktifkan foreign key checks...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Hapus data dari semua tabel terkait
    for (const table of referencingTables) {
      const tableName = table.TABLE_NAME;
      console.log(`Menghapus data dari tabel ${tableName}...`);
      await connection.query(`TRUNCATE TABLE ${tableName}`);
    }

    // Hapus data dari tabel participants
    console.log("Menghapus semua data participant...");
    await connection.query("TRUNCATE TABLE participants");

    // Mengaktifkan kembali foreign key checks
    console.log("Mengaktifkan kembali foreign key checks...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Semua data participant berhasil dihapus!");
  } catch (error) {
    console.error("Error menghapus data participant:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Koneksi database ditutup");
    }
  }
}

// Jalankan fungsi utama
deleteAllParticipants();
