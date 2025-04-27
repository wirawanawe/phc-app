import { NextResponse } from "next/server";
import {
  UserModel,
  DoctorModel,
  ParticipantModel,
  AppointmentModel,
  HealthProgramModel,
  initializeDatabase,
} from "@/app/models";

// GET statistics for admin dashboard
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Count records from each table
    const [
      usersCount,
      doctorsCount,
      participantsCount,
      appointmentsCount,
      programsCount,
    ] = await Promise.all([
      UserModel.count(),
      DoctorModel.count(),
      ParticipantModel.count(),
      AppointmentModel.count(),
      HealthProgramModel.count(),
    ]);

    // Return counts as statistics
    return NextResponse.json({
      users: usersCount,
      doctors: doctorsCount,
      participants: participantsCount,
      appointments: appointmentsCount,
      programs: programsCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin dashboard statistics" },
      { status: 500 }
    );
  }
}
