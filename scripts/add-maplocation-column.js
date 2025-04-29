// Script untuk menambahkan kolom mapLocation ke tabel website_settings
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Konfigurasi database dari variabel lingkungan
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

async function runMigration() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Connection to database established successfully.");

    // Tambahkan kolom mapLocation ke tabel website_settings tanpa default
    await sequelize.query(`
      ALTER TABLE website_settings 
      ADD COLUMN mapLocation TEXT NULL
    `);

    console.log(
      "Kolom mapLocation telah berhasil ditambahkan ke tabel website_settings."
    );

    // Setelah menambahkan kolom, update semua baris dengan nilai default
    await sequelize.query(`
      UPDATE website_settings 
      SET mapLocation = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126933.56208307289!2d106.7271068502019!3d-6.176921781125624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f436b8c94d63%3A0x6ea6d5398b7c784d!2sJakarta%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1667793998540!5m2!1sid!2sid'
    `);

    console.log(
      "Nilai default untuk kolom mapLocation telah diisi ke semua baris yang ada."
    );
    console.log("Migrasi selesai dengan sukses.");
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan migrasi:", error);
  } finally {
    // Tutup koneksi
    await sequelize.close();
    console.log("Koneksi database ditutup.");
  }
}

// Jalankan migrasi
runMigration();
