import { NextRequest, NextResponse } from "next/server";
import {
  AppointmentModel,
  initializeDatabase,
  ParticipantModel,
  DoctorModel,
} from "@/app/models";
import { verifyToken } from "@/app/utils/auth";

// GET current user's appointments
export async function GET(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Get token from cookie
    const token = request.cookies.get("phc_token")?.value;

    // If no token in cookie, check header as fallback
    const authHeader = request.headers.get("authorization");
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // Use token from cookie or header
    const authToken = token || headerToken;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token and get user ID
    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Check if the user has a participant profile
    const participant = await ParticipantModel.findByPk(userId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      );
    }

    // Fetch the user's appointments
    const appointments = await AppointmentModel.findAll({
      where: { participantId: participant.id },
      order: [["date", "DESC"]],
      include: [{ model: DoctorModel, as: "doctor" }],
    });

    // Get today's date at 00:00:00 (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find past appointments that are still marked as "scheduled"
    const pastScheduledAppointments = appointments.filter(
      (appointment) =>
        appointment.status === "scheduled" && new Date(appointment.date) < today
    );

    // Update past scheduled appointments to "completed"
    if (pastScheduledAppointments.length > 0) {
      await Promise.all(
        pastScheduledAppointments.map(async (appointment) => {
          appointment.status = "completed";
          await appointment.save();
        })
      );
    }

    // Fetch updated appointments after status changes
    const updatedAppointments =
      pastScheduledAppointments.length > 0
        ? await AppointmentModel.findAll({
            where: { participantId: participant.id },
            order: [["date", "DESC"]],
            include: [{ model: DoctorModel, as: "doctor" }],
          })
        : appointments;

    return NextResponse.json(updatedAppointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
