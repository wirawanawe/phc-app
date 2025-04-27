const sequelize = require("../app/config/db.config").default;
const {
  healthProgramSeeds: importedPrograms,
  taskSeeds: importedTasks,
} = require("../app/data/health-program-seeds");
const { HealthProgramModel } = require("../app/models/HealthProgram");
const TaskModel = require("../app/models/Task").default;

async function seedDatabase() {
  try {
    // Force sync database (CAUTION: this will drop tables if they exist)
    // Set to false in production or if you don't want to drop existing tables
    const force = true;

    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connection established successfully.");

    console.log("Syncing database models...");
    await sequelize.sync({ force });
    console.log("Database models synced.");

    // Insert health programs - let Sequelize handle the type conversions
    console.log("Inserting health programs...");
    const healthPrograms = await HealthProgramModel.bulkCreate(
      importedPrograms
    );
    console.log(`${healthPrograms.length} health programs inserted.`);

    // Insert tasks - let Sequelize handle the type conversions
    console.log("Inserting tasks...");
    const tasks = await TaskModel.bulkCreate(importedTasks);
    console.log(`${tasks.length} tasks inserted.`);

    console.log("Seeding completed successfully!");

    // Close the database connection
    await sequelize.close();
    console.log("Database connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
