const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

async function updateProgramEnrollmentTrigger() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    console.log("Updating program enrollment trigger...");

    // Drop and recreate the trigger to remove start date check
    await sequelize.query(`DROP TRIGGER IF EXISTS validate_program_dates;`);

    await sequelize.query(`
      CREATE TRIGGER validate_program_dates
      BEFORE INSERT ON participant_enrollments
      FOR EACH ROW
      BEGIN
        DECLARE program_start_date DATE;
        DECLARE program_end_date DATE;
        DECLARE program_status VARCHAR(20);
        
        SELECT startDate, endDate, status INTO program_start_date, program_end_date, program_status
        FROM health_programs
        WHERE id = NEW.healthProgramId;
        
        IF program_status != 'active' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cannot enroll in an inactive program';
        END IF;
        
        IF program_end_date IS NOT NULL AND program_end_date < CURDATE() THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cannot enroll in a program that has ended';
        END IF;
      END;
    `);

    console.log("Program enrollment trigger updated successfully.");
  } catch (error) {
    console.error("Error updating program enrollment trigger:", error);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

// Run the function
updateProgramEnrollmentTrigger();
