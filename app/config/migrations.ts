import { sequelize } from "../models";
import { QueryTypes } from "sequelize";

export const runMigrations = async () => {
  try {
    console.log("Running database migrations...");

    // Add any migrations here
    await migrateIdentityNumber();
    await migrateInsuracePaths();
    await migrateHealthProgramFields();
    await migrateTaskFields();
    await createParticipantEnrollmentsTable();
    await createParticipantTasksTable();
    await fixParticipantsForeignKeyConstraints();
    await migrateWebsiteSettingsSocialMedia();
    await fixEnrollmentIssues();

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

// Migration: Create participant_tasks table if it doesn't exist
async function createParticipantTasksTable() {
  try {
    // Check if participant_tasks table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'participant_tasks'
    `);

    if (tables.length === 0) {
      // Create participant_tasks table
      await sequelize.query(`
        CREATE TABLE participant_tasks (
          id VARCHAR(36) PRIMARY KEY,
          participantId VARCHAR(36) NOT NULL,
          taskId VARCHAR(36) NOT NULL,
          status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
          completedAt DATETIME NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          UNIQUE KEY task_participant_unique (taskId, participantId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("Migration: Created participant_tasks table");
    }
  } catch (error) {
    console.error("Error creating participant_tasks table:", error);
  }
}

// Migration: Fix participants foreign key constraints
async function fixParticipantsForeignKeyConstraints() {
  try {
    console.log(
      "Running participants foreign key constraints fix migration..."
    );

    // First, add ON DELETE CASCADE to all foreign keys pointing to participants
    // Get all tables that reference participants
    const [referencingTables] = await sequelize.query(`
      SELECT TABLE_NAME, CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'participants' 
      AND REFERENCED_COLUMN_NAME = 'id'
      AND TABLE_SCHEMA = DATABASE()
    `);

    console.log(
      `Found ${referencingTables.length} tables referencing participants table`
    );

    for (const table of referencingTables) {
      const tableName = (table as any).TABLE_NAME;
      const constraintName = (table as any).CONSTRAINT_NAME;

      // Check if ON DELETE CASCADE is missing
      const [foreignKeyInfo] = await sequelize.query(`
        SELECT DELETE_RULE
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
        WHERE CONSTRAINT_NAME = '${constraintName}'
        AND CONSTRAINT_SCHEMA = DATABASE()
      `);

      const deleteRule = (foreignKeyInfo as any)[0]?.DELETE_RULE;

      if (deleteRule !== "CASCADE") {
        console.log(
          `Fixing foreign key constraint ${constraintName} on table ${tableName}...`
        );

        // Drop the existing constraint
        await sequelize.query(`
          ALTER TABLE ${tableName}
          DROP FOREIGN KEY ${constraintName}
        `);

        // Get the column name that references participants.id
        const [columnInfo] = await sequelize.query(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE CONSTRAINT_NAME = '${constraintName}'
          AND TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = '${tableName}'
        `);

        const columnName = (columnInfo as any)[0]?.COLUMN_NAME;

        // Recreate the constraint with ON DELETE CASCADE
        await sequelize.query(`
          ALTER TABLE ${tableName}
          ADD CONSTRAINT ${constraintName}
          FOREIGN KEY (${columnName})
          REFERENCES participants(id)
          ON DELETE CASCADE
        `);

        console.log(
          `Fixed foreign key constraint ${constraintName} on table ${tableName}`
        );
      } else {
        console.log(
          `Foreign key constraint ${constraintName} on table ${tableName} already has ON DELETE CASCADE`
        );
      }
    }

    console.log("Completed participants foreign key constraints fix migration");
  } catch (error) {
    console.error("Error fixing participants foreign key constraints:", error);
  }
}

// Migration: Add social media fields to website_settings table
async function migrateWebsiteSettingsSocialMedia() {
  try {
    // Check if facebook column doesn't exist
    const [facebookColumn] = await sequelize.query(`
      SHOW COLUMNS FROM website_settings LIKE 'facebook'
    `);

    if (facebookColumn.length === 0) {
      // Add facebook column
      await sequelize.query(`
        ALTER TABLE website_settings 
        ADD COLUMN facebook VARCHAR(255) NULL DEFAULT ''
      `);
      console.log("Migration: Added facebook column to website_settings");
    }

    // Check if twitter column doesn't exist
    const [twitterColumn] = await sequelize.query(`
      SHOW COLUMNS FROM website_settings LIKE 'twitter'
    `);

    if (twitterColumn.length === 0) {
      // Add twitter column
      await sequelize.query(`
        ALTER TABLE website_settings 
        ADD COLUMN twitter VARCHAR(255) NULL DEFAULT ''
      `);
      console.log("Migration: Added twitter column to website_settings");
    }

    // Check if instagram column doesn't exist
    const [instagramColumn] = await sequelize.query(`
      SHOW COLUMNS FROM website_settings LIKE 'instagram'
    `);

    if (instagramColumn.length === 0) {
      // Add instagram column
      await sequelize.query(`
        ALTER TABLE website_settings 
        ADD COLUMN instagram VARCHAR(255) NULL DEFAULT ''
      `);
      console.log("Migration: Added instagram column to website_settings");
    }

    // Check if youtube column doesn't exist
    const [youtubeColumn] = await sequelize.query(`
      SHOW COLUMNS FROM website_settings LIKE 'youtube'
    `);

    if (youtubeColumn.length === 0) {
      // Add youtube column
      await sequelize.query(`
        ALTER TABLE website_settings 
        ADD COLUMN youtube VARCHAR(255) NULL DEFAULT ''
      `);
      console.log("Migration: Added youtube column to website_settings");
    }
  } catch (error) {
    console.error(
      "Error during website settings social media migration:",
      error
    );
  }
}

// Migration: Fix enrollment-related issues
async function fixEnrollmentIssues() {
  try {
    // Check if triggers already exist before creating them
    const checkTriggerExists = async (
      triggerName: string
    ): Promise<boolean> => {
      try {
        const [result] = await sequelize.query(
          `SELECT TRIGGER_NAME FROM information_schema.TRIGGERS 
           WHERE TRIGGER_SCHEMA = DATABASE() AND TRIGGER_NAME = ?`,
          {
            replacements: [triggerName],
            type: QueryTypes.SELECT,
          }
        );
        return result !== undefined;
      } catch (error) {
        return false;
      }
    };

    // Add triggers to sync program and enrollment status
    const trigger1Exists = await checkTriggerExists(
      "sync_program_status_to_enrollments"
    );
    if (!trigger1Exists) {
      await sequelize.query(
        `DROP TRIGGER IF EXISTS sync_program_status_to_enrollments;`
      );

      await sequelize.query(`
        CREATE TRIGGER sync_program_status_to_enrollments
        AFTER UPDATE ON health_programs
        FOR EACH ROW
        BEGIN
          IF NEW.status != OLD.status THEN
            UPDATE participant_enrollments
            SET status = NEW.status
            WHERE healthProgramId = NEW.id AND status = 'active';
          END IF;
        END;
      `);
    }

    // Add trigger to automatically update enrollment status based on program dates
    const trigger2Exists = await checkTriggerExists(
      "update_enrollment_status_on_program_dates"
    );
    if (!trigger2Exists) {
      await sequelize.query(
        `DROP TRIGGER IF EXISTS update_enrollment_status_on_program_dates;`
      );

      await sequelize.query(`
        CREATE TRIGGER update_enrollment_status_on_program_dates
        AFTER UPDATE ON health_programs
        FOR EACH ROW
        BEGIN
          -- If program end date is reached, mark all active enrollments as completed
          IF NEW.endDate IS NOT NULL AND NEW.endDate < CURDATE() THEN
            UPDATE participant_enrollments
            SET status = 'completed', completionDate = NOW()
            WHERE healthProgramId = NEW.id AND status = 'active';
          END IF;
          
          -- If program is not active, mark all active enrollments as inactive
          IF NEW.status != 'active' THEN
            UPDATE participant_enrollments
            SET status = NEW.status
            WHERE healthProgramId = NEW.id AND status = 'active';
          END IF;
        END;
      `);
    }

    // Add validation for program dates
    const trigger3Exists = await checkTriggerExists("validate_program_dates");
    if (!trigger3Exists) {
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
    }

    // Add validation for maximum participants
    const trigger4Exists = await checkTriggerExists(
      "validate_max_participants"
    );
    if (!trigger4Exists) {
      await sequelize.query(
        `DROP TRIGGER IF EXISTS validate_max_participants;`
      );

      await sequelize.query(`
        CREATE TRIGGER validate_max_participants
        BEFORE INSERT ON participant_enrollments
        FOR EACH ROW
        BEGIN
          DECLARE max_participants INT;
          DECLARE current_participants INT;
          
          SELECT maxParticipants INTO max_participants
          FROM health_programs
          WHERE id = NEW.healthProgramId;
          
          IF max_participants IS NOT NULL THEN
            SELECT COUNT(*) INTO current_participants
            FROM participant_enrollments
            WHERE healthProgramId = NEW.healthProgramId AND status = 'active';
            
            IF current_participants >= max_participants THEN
              SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Program has reached maximum number of participants';
            END IF;
          END IF;
        END;
      `);
    }

    // Add trigger to complete enrollments when all tasks are completed
    const trigger5Exists = await checkTriggerExists(
      "complete_enrollment_on_all_tasks_completed"
    );
    if (!trigger5Exists) {
      await sequelize.query(
        `DROP TRIGGER IF EXISTS complete_enrollment_on_all_tasks_completed;`
      );

      await sequelize.query(`
        CREATE TRIGGER complete_enrollment_on_all_tasks_completed
        AFTER UPDATE ON participant_tasks
        FOR EACH ROW
        BEGIN
          DECLARE total_tasks INT;
          DECLARE completed_tasks INT;
          DECLARE program_id VARCHAR(36);
          DECLARE participant_id VARCHAR(36);
          
          -- Get the program ID and participant ID
          SELECT t.healthProgramId, pt.participantId INTO program_id, participant_id
          FROM tasks t
          JOIN participant_tasks pt ON t.id = pt.taskId
          WHERE pt.id = NEW.id;
          
          -- Count total tasks and completed tasks
          SELECT 
            COUNT(*) INTO total_tasks
          FROM tasks t
          WHERE t.healthProgramId = program_id;
          
          SELECT 
            COUNT(*) INTO completed_tasks
          FROM tasks t
          JOIN participant_tasks pt ON t.id = pt.taskId
          WHERE t.healthProgramId = program_id 
          AND pt.participantId = participant_id
          AND pt.status = 'completed';
          
          -- If all tasks are completed, update enrollment status
          IF total_tasks > 0 AND completed_tasks = total_tasks THEN
            UPDATE participant_enrollments
            SET status = 'completed', completionDate = NOW()
            WHERE participantId = participant_id 
            AND healthProgramId = program_id 
            AND status = 'active';
          END IF;
        END;
      `);
    }

    console.log("Migration: Fixed enrollment-related issues");
  } catch (error) {
    console.error("Error fixing enrollment issues:", error);
  }
}
