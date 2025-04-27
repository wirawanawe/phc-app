import { sequelize } from "../models";

export const runMigrations = async () => {
  try {
    console.log("Running database migrations...");

    // Add any migrations here
    await migrateIdentityNumber();
    await migrateInsuracePaths();
    await migrateHealthProgramFields();
    await migrateTaskFields();
    await createParticipantEnrollmentsTable();

    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
};

// Migration: Rename ktpNumber to identityNumber in participants table
async function migrateIdentityNumber() {
  try {
    // Check if ktpNumber column exists
    const [ktpColumn] = await sequelize.query(`
      SHOW COLUMNS FROM participants LIKE 'ktpNumber'
    `);

    if (ktpColumn.length > 0) {
      // Check if identityNumber column doesn't exist
      const [identityColumn] = await sequelize.query(`
        SHOW COLUMNS FROM participants LIKE 'identityNumber'
      `);

      if (identityColumn.length === 0) {
        // Rename ktpNumber to identityNumber
        await sequelize.query(`
          ALTER TABLE participants 
          CHANGE COLUMN ktpNumber identityNumber VARCHAR(50) NULL
        `);
        console.log("Migration: Renamed ktpNumber to identityNumber");
      }
    }
  } catch (error) {
    console.error("Error during identityNumber migration:", error);
  }
}

// Migration: Add insuranceId and insuranceNumber columns to participants table
async function migrateInsuracePaths() {
  try {
    // Check if insuranceId column doesn't exist
    const [insuranceIdColumn] = await sequelize.query(`
      SHOW COLUMNS FROM participants LIKE 'insuranceId'
    `);

    if (insuranceIdColumn.length === 0) {
      // Add insuranceId column
      await sequelize.query(`
        ALTER TABLE participants 
        ADD COLUMN insuranceId VARCHAR(36) NULL,
        ADD CONSTRAINT fk_participant_insurance 
        FOREIGN KEY (insuranceId) 
        REFERENCES insurances(id) 
        ON DELETE SET NULL
      `);
      console.log("Migration: Added insuranceId column to participants");
    }

    // Check if insuranceNumber column doesn't exist
    const [insuranceNumberColumn] = await sequelize.query(`
      SHOW COLUMNS FROM participants LIKE 'insuranceNumber'
    `);

    if (insuranceNumberColumn.length === 0) {
      // Add insuranceNumber column
      await sequelize.query(`
        ALTER TABLE participants 
        ADD COLUMN insuranceNumber VARCHAR(50) NULL
      `);
      console.log("Migration: Added insuranceNumber column to participants");
    }
  } catch (error) {
    console.error("Error during insurance paths migration:", error);
  }
}

// Migration: Add or modify fields in health_programs table
async function migrateHealthProgramFields() {
  try {
    // Check if location column doesn't exist
    const [locationColumn] = await sequelize.query(`
      SHOW COLUMNS FROM health_programs LIKE 'location'
    `);

    if (locationColumn.length === 0) {
      // Add location column
      await sequelize.query(`
        ALTER TABLE health_programs 
        ADD COLUMN location VARCHAR(100) NULL
      `);
      console.log("Migration: Added location column to health_programs");
    }

    // Check if maxParticipants column doesn't exist
    const [maxParticipantsColumn] = await sequelize.query(`
      SHOW COLUMNS FROM health_programs LIKE 'maxParticipants'
    `);

    if (maxParticipantsColumn.length === 0) {
      // Add maxParticipants column
      await sequelize.query(`
        ALTER TABLE health_programs 
        ADD COLUMN maxParticipants INT NULL
      `);
      console.log("Migration: Added maxParticipants column to health_programs");
    }
  } catch (error) {
    console.error("Error during health program fields migration:", error);
  }
}

// Migration: Add or modify fields in tasks table
async function migrateTaskFields() {
  try {
    // Check if priority column doesn't exist
    const [priorityColumn] = await sequelize.query(`
      SHOW COLUMNS FROM tasks LIKE 'priority'
    `);

    if (priorityColumn.length === 0) {
      // Add priority column
      await sequelize.query(`
        ALTER TABLE tasks 
        ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium'
      `);
      console.log("Migration: Added priority column to tasks");
    }

    // Check if timePerformed column doesn't exist
    const [timePerformedColumn] = await sequelize.query(`
      SHOW COLUMNS FROM tasks LIKE 'timePerformed'
    `);

    if (timePerformedColumn.length === 0) {
      // Add timePerformed column (how long task typically takes)
      await sequelize.query(`
        ALTER TABLE tasks 
        ADD COLUMN timePerformed VARCHAR(50) NULL
      `);
      console.log("Migration: Added timePerformed column to tasks");
    }
  } catch (error) {
    console.error("Error during task fields migration:", error);
  }
}

// Migration: Create participant_enrollments table if it doesn't exist
async function createParticipantEnrollmentsTable() {
  try {
    // Check if participant_enrollments table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'participant_enrollments'
    `);

    if (tables.length === 0) {
      // Create participant_enrollments table
      await sequelize.query(`
        CREATE TABLE participant_enrollments (
          id VARCHAR(36) PRIMARY KEY,
          participantId VARCHAR(36) NOT NULL,
          healthProgramId VARCHAR(36) NOT NULL,
          status ENUM('active', 'completed', 'inactive') NOT NULL DEFAULT 'active',
          enrollmentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          completionDate DATETIME NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE,
          FOREIGN KEY (healthProgramId) REFERENCES health_programs(id) ON DELETE CASCADE,
          UNIQUE KEY enrollment_unique (participantId, healthProgramId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("Migration: Created participant_enrollments table");
    }
  } catch (error) {
    console.error("Error creating participant_enrollments table:", error);
  }
}
