import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import * as mysql from "mysql2/promise";

dotenv.config();

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT as string, 10),
  dialect: "mysql",
  dialectModule: require("mysql2"), // Explicitly provide the mysql2 module
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

// Alternative test connection using mysql2 directly
export const testConnection = async () => {
  try {
    // First try direct mysql2 connection
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    await connection.execute("SELECT 1");
    await connection.end();
    console.log("Direct MySQL connection successful");
    return true;
  } catch (directError) {
    console.error("Direct MySQL connection failed:", directError);

    try {
      // Fall back to Sequelize connection test
      await sequelize.authenticate();
      console.log("Sequelize connection successful");
      return true;
    } catch (sequelizeError) {
      console.error("Sequelize connection failed:", sequelizeError);
      return false;
    }
  }
};

export default sequelize;
