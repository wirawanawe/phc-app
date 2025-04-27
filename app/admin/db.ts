"use server";

import { sequelize, initializeDatabase } from "../models";
import {
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
} from "../models";

// Initialize database when app starts
export const initDb = async () => {
  try {
    await initializeDatabase();
    console.log("Database initialized for admin dashboard");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Generic fetch function for admin dashboard data
export async function fetchData(model: any, options: any = {}) {
  try {
    const data = await model.findAll(options);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export models for admin dashboard use
export {
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
};

export default sequelize;
