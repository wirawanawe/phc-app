const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runSQL() {
  let connection;
  try {
    console.log("Masukkan kredensial database MySQL:");
    const host =
      (await askQuestion("Host (default: localhost): ")) || "localhost";
    const port = (await askQuestion("Port (default: 3306): ")) || "3306";
    const user = await askQuestion("Username: ");
    const password = await askQuestion("Password: ");
    const database =
      (await askQuestion("Database (default: phc_db): ")) || "phc_db";

    if (!user) {
      console.error("Username tidak boleh kosong");
      rl.close();
      return;
    }

    // Koneksi ke database
    connection = await mysql.createConnection({
      host,
      port: parseInt(port, 10),
      user,
      password,
      database,
      multipleStatements: true,
    });

    console.log("Terhubung ke database berhasil!");

    // Baca file SQL
    const sqlFilePath = path.join(__dirname, "create-appointments.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Menjalankan SQL query...");

    // Jalankan SQL
    await connection.query(sql);
    console.log("SQL telah dijalankan dengan sukses");

    // Verifikasi tabel appointments telah dibuat
    const [rows] = await connection.query('SHOW TABLES LIKE "appointments"');
    if (rows.length > 0) {
      console.log("Tabel appointments berhasil dibuat!");
    } else {
      console.log("Tabel appointments gagal dibuat.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Koneksi database ditutup");
    }
    rl.close();
  }
}

runSQL();
