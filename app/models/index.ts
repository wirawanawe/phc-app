import sequelize from "../config/db.config";
import UserModel from "./User";
import DoctorModel from "./Doctor";
import ParticipantModel from "./Participant";
import AppointmentModel from "./Appointment";
import { HealthProgramModel } from "./HealthProgram";
import SpesializationModel from "./Spesialization";
import InsuranceModel from "./Insurance";
import TaskModel, { setTaskAssociations } from "./Task";
import ProgramCategoryModel from "./ProgramCategory";
import { runMigrations } from "../config/migrations";

// Define associations between models
// Appointments belong to Doctor and Participant
AppointmentModel.belongsTo(ParticipantModel, { foreignKey: "participantId" });
AppointmentModel.belongsTo(DoctorModel, { foreignKey: "doctorId" });

// Doctor and Participant can have many Appointments
ParticipantModel.hasMany(AppointmentModel, { foreignKey: "participantId" });
DoctorModel.hasMany(AppointmentModel, { foreignKey: "doctorId" });

// Participant belongs to Insurance
ParticipantModel.belongsTo(InsuranceModel, { foreignKey: "insuranceId" });

// Participant is associated with User (one-to-one)
// When participant is deleted, the associated user will also be deleted
ParticipantModel.belongsTo(UserModel, {
  foreignKey: "id",
  onDelete: "CASCADE",
});
UserModel.hasOne(ParticipantModel, { foreignKey: "id", onDelete: "CASCADE" });

// Set up Task associations with HealthProgram
setTaskAssociations();

// HealthProgram belongs to ProgramCategory
HealthProgramModel.belongsTo(ProgramCategoryModel, {
  foreignKey: "categoryId",
});
ProgramCategoryModel.hasMany(HealthProgramModel, { foreignKey: "categoryId" });

// Export the database connection and models
export {
  sequelize,
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
  SpesializationModel,
  InsuranceModel,
  TaskModel,
  ProgramCategoryModel,
};

// Initialize database and models
export const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Check if health_programs table exists and fix its categoryId column if needed
    try {
      // Check if the table exists first
      const [tables] = await sequelize.query(
        "SHOW TABLES LIKE 'health_programs'"
      );

      if (tables.length > 0) {
        console.log(
          "Attempting to fix health_programs.categoryId if needed..."
        );

        // Drop the foreign key constraint if it exists
        try {
          await sequelize.query(
            "ALTER TABLE health_programs DROP FOREIGN KEY health_programs_ibfk_1"
          );
          console.log("Dropped foreign key constraint on health_programs");
        } catch (fkError) {
          console.log(
            "Foreign key constraint doesn't exist or couldn't be dropped"
          );
        }

        // Modify the categoryId column to match the ProgramCategory id type
        await sequelize.query(
          "ALTER TABLE health_programs MODIFY categoryId VARCHAR(36)"
        );
        console.log("Modified health_programs.categoryId to VARCHAR(36)");
      }
    } catch (fixError) {
      console.error("Error fixing health_programs table:", fixError);
      // Continue execution even if this fails
    }

    // Sync all models with the database in correct order to respect foreign key constraints
    const models = [
      UserModel,
      DoctorModel,
      ParticipantModel,
      AppointmentModel,
      ProgramCategoryModel, // ProgramCategory should be before HealthProgram due to foreign key
      HealthProgramModel,
      SpesializationModel,
      InsuranceModel,
      TaskModel,
    ];

    // First create tables if they don't exist
    await sequelize.sync();
    console.log(
      "Database tables checked. Creating tables if they don't exist."
    );

    // Run migrations to add any missing columns or make schema changes
    await runMigrations();

    // Manually alter the role column to VARCHAR(15)
    try {
      await sequelize.query(`
        ALTER TABLE users 
        MODIFY COLUMN role VARCHAR(15) NOT NULL DEFAULT 'participant'
      `);
      console.log("Updated users.role column to VARCHAR(15)");
    } catch (alterError) {
      console.error("Error altering role column:", alterError);
    }

    // Check if users table is empty and create a default admin user if needed
    try {
      const userCount = await UserModel.count();
      if (userCount === 0) {
        console.log("No users found. Creating default admin user...");
        const defaultAdmin = await UserModel.create({
          username: "admin",
          email: "admin@example.com",
          fullName: "System Administrator",
          password: "admin123", // This will be hashed by the beforeCreate hook
          role: "admin",
          isActive: true,
        });
        console.log("Created default admin user with ID:", defaultAdmin.id);
      }
    } catch (userError) {
      console.error("Error checking/creating default admin user:", userError);
    }

    // Migration: Check if ktpNumber exists and identityNumber doesn't exist, then rename the column
    try {
      // Check if participants table has ktpNumber column
      const [columnsResult] = await sequelize.query(`
        SHOW COLUMNS FROM participants LIKE 'ktpNumber'
      `);

      if (columnsResult.length > 0) {
        // Check if identityNumber column already exists
        const [identityColumnResult] = await sequelize.query(`
          SHOW COLUMNS FROM participants LIKE 'identityNumber'
        `);

        if (identityColumnResult.length === 0) {
          // Rename ktpNumber to identityNumber
          await sequelize.query(`
            ALTER TABLE participants 
            CHANGE COLUMN ktpNumber identityNumber VARCHAR(50) NULL
          `);
          console.log("Renamed 'ktpNumber' column to 'identityNumber'");
        }
      } else {
        // If ktpNumber doesn't exist, check if identityNumber exists
        const [identityColumnResult] = await sequelize.query(`
          SHOW COLUMNS FROM participants LIKE 'identityNumber'
        `);

        if (identityColumnResult.length === 0) {
          // Create identityNumber column if neither exists
          await sequelize.query(`
            ALTER TABLE participants 
            ADD COLUMN identityNumber VARCHAR(50) NULL
          `);
          console.log("Added 'identityNumber' column to participants table");
        }
      }
    } catch (columnError) {
      console.error(
        "Error migrating ktpNumber to identityNumber:",
        columnError
      );
    }

    // Add default "Umum" insurance if it doesn't exist
    try {
      const existingUmum = await InsuranceModel.findOne({
        where: { name: "Umum" },
      });

      if (!existingUmum) {
        const newUmum = await InsuranceModel.create({
          name: "Umum",
          description: "Asuransi umum yang tersedia untuk semua peserta",
          coverage: "Pemeriksaan umum dan layanan dasar",
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        console.log("Created default 'Umum' insurance with ID:", newUmum.id);
      }
    } catch (insuranceError) {
      console.error("Error creating default insurance:", insuranceError);
    }

    // Add default program category if none exists
    try {
      const categoryCount = await ProgramCategoryModel.count();
      if (categoryCount === 0) {
        const defaultCategory = await ProgramCategoryModel.create({
          name: "General",
          description: "General health programs",
          color: "#3B82F6",
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        console.log(
          "Created default 'General' program category with ID:",
          defaultCategory.id
        );
      }
    } catch (categoryError) {
      console.error("Error creating default program category:", categoryError);
    }

    // Log the synchronized tables
    for (const model of models) {
      console.log(`Synchronized model: ${model.name}`);
    }

    console.log("All models were synchronized successfully.");
    return true; // Return true to indicate successful initialization
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false; // Return false to indicate failed initialization
  }
};

// Function to reset the database (useful for development)
export const resetDatabase = async () => {
  try {
    console.log("Resetting database...");
    await sequelize.sync({ force: true });
    console.log("Database has been reset. All tables recreated.");
    return true;
  } catch (error) {
    console.error("Error resetting database:", error);
    return false;
  }
};

export default {
  sequelize,
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
  SpesializationModel,
  InsuranceModel,
  TaskModel,
  ProgramCategoryModel,
  initializeDatabase,
  resetDatabase,
};
