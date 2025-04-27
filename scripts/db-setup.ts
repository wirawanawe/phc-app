import * as dotenv from "dotenv";
import { sequelize, initializeDatabase } from "../app/models";
import {
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
} from "../app/models";

// Load environment variables
dotenv.config();

// Function to seed initial data
async function seedInitialData() {
  try {
    // Create sample doctor
    const doctor = await DoctorModel.create({
      name: "Dr. Jane Smith",
      spesialization: "Cardiologist",
      email: "jane.smith@example.com",
      phone: "123-456-7890",
    });

    // Create sample participant
    const participant = await ParticipantModel.create({
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7891",
      dateOfBirth: "1980-01-01",
      address: "123 Main St, New York, NY 10001",
    });

    // Create sample appointment
    await AppointmentModel.create({
      participantId: participant.id,
      doctorId: doctor.id,
      date: "2023-12-15",
      time: "10:00:00",
      status: "scheduled",
      notes: "Initial consultation",
    });

    // Create sample health program
    await HealthProgramModel.create({
      name: "Weight Management Program",
      description:
        "A 12-week program to help participants manage their weight through diet and exercise.",
      startDate: "2023-12-01",
      endDate: "2024-02-28",
      location: "Health Center Main Building",
      maxParticipants: 30,
      status: "active",
    });

    // Create admin user
    await UserModel.create({
      username: "admin",
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin",
      isActive: true,
    });

    console.log("Sample data has been seeded successfully!");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
}

// Run the setup
(async () => {
  try {
    console.log("Starting database setup...");

    // Initialize database (create tables)
    await initializeDatabase();
    console.log("Database initialized successfully.");

    // Check if there's data already
    const doctorCount = await DoctorModel.count();

    // Seed data if none exists
    if (doctorCount === 0) {
      console.log("No data found. Seeding initial data...");
      await seedInitialData();
    } else {
      console.log("Data already exists. Skipping seed process.");
    }

    console.log("Database setup completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
})();
