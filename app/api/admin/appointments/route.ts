import { NextRequest, NextResponse } from "next/server";
import {
  AppointmentModel,
  initializeDatabase,
  ParticipantModel,
  DoctorModel,
} from "@/app/models";

// GET all appointments from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const appointments = await AppointmentModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: ParticipantModel, as: "participant" },
        { model: DoctorModel, as: "doctor" },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST create a new appointment in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.participantId || !body.doctorId || !body.date) {
      return NextResponse.json(
        { error: "Participant ID, doctor ID, and date are required fields" },
        { status: 400 }
      );
    }

    // Create appointment in database
    const newAppointment = await AppointmentModel.create({
      participantId: body.participantId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      status: body.status || "scheduled",
      notes: body.notes,
    });

    // Fetch the complete appointment with participant and doctor
    const appointment = await AppointmentModel.findByPk(newAppointment.id, {
      include: [
        { model: ParticipantModel, as: "participant" },
        { model: DoctorModel, as: "doctor" },
      ],
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment in database:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
