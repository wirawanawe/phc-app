import { NextRequest, NextResponse } from "next/server";
import { Appointment } from "@/app/types";

// Import from the main route file where the array is exported
import { appointments } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const appointment = appointments.find((a: Appointment) => a.id === id);

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(appointment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the appointment
    const appointmentIndex = appointments.findIndex(
      (a: Appointment) => a.id === id
    );
    if (appointmentIndex === -1) {
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

    // Update the appointment (keeping the id and createdAt the same)
    const updatedAppointment: Appointment = {
      ...appointments[appointmentIndex],
      participantId: body.participantId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      status: body.status || appointments[appointmentIndex].status,
      notes: body.notes,
      // Don't update id or createdAt
    };

    appointments[appointmentIndex] = updatedAppointment;

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
    const id = params.id;

    // Check if appointment exists
    const appointmentIndex = appointments.findIndex(
      (a: Appointment) => a.id === id
    );
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Remove the appointment
    appointments.splice(appointmentIndex, 1);

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
