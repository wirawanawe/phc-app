import { NextRequest, NextResponse } from "next/server";
import {
  AppointmentModel,
  ParticipantModel,
  DoctorModel,
  initializeDatabase,
} from "@/app/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;

    // Find appointment in database
    const appointment = await AppointmentModel.findByPk(id, {
      include: [
        { model: ParticipantModel, as: "participant" },
        { model: DoctorModel, as: "doctor" },
      ],
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;
    const body = await request.json();

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.participantId || !body.doctorId || !body.date) {
      return NextResponse.json(
        { error: "Participant ID, doctor ID, and date are required fields" },
        { status: 400 }
      );
    }

    // Update the appointment
    await appointment.update({
      participantId: body.participantId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      status: body.status || appointment.status,
      notes: body.notes,
    });

    // Fetch the updated appointment with related data
    const updatedAppointment = await AppointmentModel.findByPk(id, {
      include: [
        { model: ParticipantModel, as: "participant" },
        { model: DoctorModel, as: "doctor" },
      ],
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;

    // Check if appointment exists
    const appointment = await AppointmentModel.findByPk(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Remove the appointment
    await appointment.destroy();

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
