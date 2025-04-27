import { NextRequest, NextResponse } from "next/server";
import {
  AppointmentModel,
  initializeDatabase,
  ParticipantModel,
  DoctorModel,
} from "@/app/models";

// GET a specific appointment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
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

// PUT update an appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const body = await request.json();

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update the appointment
    await appointment.update({
      participantId: body.participantId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      status: body.status,
      notes: body.notes,
    });

    // Get the updated appointment with relationships
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

// DELETE an appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Delete the appointment
    await appointment.destroy();

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
