#!/usr/bin/env node

// This script seeds health programs and tasks data into the database
require("dotenv").config();
const readline = require("readline");

const { v4: uuidv4 } = require("uuid");
const { Sequelize, DataTypes } = require("sequelize");

// Database configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306";
const DB_NAME = process.env.DB_NAME || "phc_db";
const DB_USER = process.env.DB_USER || "root";
let DB_PASSWORD = process.env.DB_PASSWORD || "pr1k1t1w";

// Check if we have a password from env
console.log(
  `Connecting to database ${DB_NAME} on ${DB_HOST}:${DB_PORT} as ${DB_USER}`
);
if (!process.env.DB_PASSWORD) {
  console.log("Warning: No DB_PASSWORD found in environment variables");
}

// Create Sequelize instance and connect
function createSequelizeInstance(password) {
  return new Sequelize(DB_NAME, DB_USER, password, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
  });
}

// Define simplified models for seeding
const defineModels = (sequelize) => {
  const HealthProgram = sequelize.define(
    "HealthProgram",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "health_programs",
      timestamps: true,
    }
  );

  const Task = sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      healthProgramId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      timePerformed: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "medium",
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tasks",
      timestamps: true,
    }
  );

  // Set up associations
  HealthProgram.hasMany(Task, {
    foreignKey: "healthProgramId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Task.belongsTo(HealthProgram, { foreignKey: "healthProgramId" });

  return { HealthProgram, Task };
};

// Generate 6 health programs with their associated tasks
const healthProgramSeeds = [
  {
    id: uuidv4(),
    name: "Diabetes Management Program",
    description:
      "A comprehensive program for managing diabetes through lifestyle changes, nutrition, and regular monitoring.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    location: "Main Health Center",
    maxParticipants: 30,
    status: "active",
  },
  {
    id: uuidv4(),
    name: "Heart Health Initiative",
    description:
      "Program designed to improve cardiovascular health through exercise, diet, and regular checkups.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    location: "Community Fitness Center",
    maxParticipants: 25,
    status: "active",
  },
  {
    id: uuidv4(),
    name: "Mental Wellness Workshop",
    description:
      "Series of workshops focusing on stress management, mindfulness, and mental health awareness.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    location: "Wellness Center",
    maxParticipants: 20,
    status: "active",
  },
  {
    id: uuidv4(),
    name: "Weight Management Program",
    description:
      "A structured program to help participants achieve and maintain a healthy weight through balanced nutrition and physical activity.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
    location: "Nutrition Center",
    maxParticipants: 15,
    status: "active",
  },
  {
    id: uuidv4(),
    name: "Smoking Cessation Support",
    description:
      "Support program for individuals trying to quit smoking, including counseling, resources, and peer support.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    location: "Health Education Center",
    maxParticipants: 12,
    status: "active",
  },
  {
    id: uuidv4(),
    name: "Senior Fitness Program",
    description:
      "Fitness program tailored for seniors to improve mobility, strength, and overall quality of life.",
    categoryId: uuidv4(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 5)),
    location: "Senior Community Center",
    maxParticipants: 20,
    status: "active",
  },
];

// Create task seeds after health programs are defined
const createTaskSeeds = () => {
  return [
    // Tasks for Diabetes Management Program
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[0].id,
      title: "Blood Sugar Monitoring",
      description:
        "Monitor blood sugar levels twice daily and record in the health journal.",
      timePerformed: "08:00:00",
      status: "active",
      priority: "high",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[0].id,
      title: "Dietary Review Session",
      description:
        "One-on-one session with a nutritionist to review and adjust meal plans.",
      timePerformed: "14:00:00",
      status: "active",
      priority: "medium",
    },

    // Tasks for Heart Health Initiative
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[1].id,
      title: "Cardio Exercise Session",
      description: "Participate in a 30-minute guided cardio workout session.",
      timePerformed: "09:30:00",
      status: "active",
      priority: "high",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[1].id,
      title: "Blood Pressure Check",
      description:
        "Regular blood pressure monitoring and recording results in the health app.",
      timePerformed: "18:00:00",
      status: "active",
      priority: "medium",
    },

    // Tasks for Mental Wellness Workshop
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[2].id,
      title: "Mindfulness Meditation",
      description:
        "Practice guided mindfulness meditation for 15 minutes daily.",
      timePerformed: "07:00:00",
      status: "active",
      priority: "medium",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[2].id,
      title: "Stress Journal Entry",
      description:
        "Maintain a daily journal entry identifying stress triggers and coping strategies.",
      timePerformed: "21:00:00",
      status: "active",
      priority: "low",
    },

    // Tasks for Weight Management Program
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[3].id,
      title: "Weekly Weigh-In",
      description: "Record weight measurements weekly to track progress.",
      timePerformed: "08:00:00",
      status: "active",
      priority: "medium",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[3].id,
      title: "Meal Planning Workshop",
      description:
        "Participate in a group workshop focused on meal planning and preparation.",
      timePerformed: "16:00:00",
      status: "active",
      priority: "high",
    },

    // Tasks for Smoking Cessation Support
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[4].id,
      title: "Craving Management Exercise",
      description:
        "Practice breathing exercises and distraction techniques when cravings occur.",
      timePerformed: "12:00:00",
      status: "active",
      priority: "high",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[4].id,
      title: "Support Group Meeting",
      description:
        "Attend weekly support group meetings to share experiences and challenges.",
      timePerformed: "19:00:00",
      status: "active",
      priority: "medium",
    },

    // Tasks for Senior Fitness Program
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[5].id,
      title: "Chair Yoga Session",
      description:
        "Participate in gentle yoga exercises that can be done while seated.",
      timePerformed: "10:00:00",
      status: "active",
      priority: "medium",
    },
    {
      id: uuidv4(),
      healthProgramId: healthProgramSeeds[5].id,
      title: "Balance and Coordination Exercises",
      description:
        "Practice exercises designed to improve balance and coordination to prevent falls.",
      timePerformed: "15:30:00",
      status: "active",
      priority: "high",
    },
  ];
};

async function seedDatabase(sequelize) {
  try {
    console.log("Authenticating connection...");
    await sequelize.authenticate();
    console.log("Connection established successfully.");

    // Define models
    const { HealthProgram, Task } = defineModels(sequelize);

    // Drop existing tables manually to avoid foreign key issues
    console.log("Dropping existing tables...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    try {
      await sequelize.query("DROP TABLE IF EXISTS tasks");
      await sequelize.query("DROP TABLE IF EXISTS health_programs");
      await sequelize.query("DROP TABLE IF EXISTS health_program_tasks");
    } catch (dropError) {
      console.warn("Warning during table drop:", dropError.message);
    }
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    // Create tables explicitly in the correct order
    console.log("Creating tables...");
    await HealthProgram.sync();
    await Task.sync();
    console.log("Tables created successfully.");

    // Insert health programs
    console.log("Inserting health programs...");
    const healthPrograms = await HealthProgram.bulkCreate(healthProgramSeeds);
    console.log(`${healthPrograms.length} health programs inserted.`);

    // Insert tasks
    console.log("Inserting tasks...");
    const taskSeeds = createTaskSeeds();
    const tasks = await Task.bulkCreate(taskSeeds);
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

// Main function to handle potential database connection issues
async function main() {
  try {
    const sequelize = createSequelizeInstance(DB_PASSWORD);
    await seedDatabase(sequelize);
  } catch (error) {
    if (error.name === "SequelizeAccessDeniedError") {
      console.log(
        "Connection failed. Please check your database credentials in the .env file."
      );
      console.log("You might need to:");
      console.log("1. Create a .env file with correct MySQL credentials");
      console.log("2. Make sure MySQL server is running");
      console.log("3. Verify the user has proper permissions");
      process.exit(1);
    } else {
      console.error("Unexpected error:", error);
      process.exit(1);
    }
  }
}

// Run the main function
main();
