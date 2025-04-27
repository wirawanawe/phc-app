import { NextRequest, NextResponse } from "next/server";
import { Doctor } from "@/app/types";

// This would normally be imported from a database module
// For now, we'll use the reference to the array in the main route file
// In a real app, you would have proper data access functions
import { doctors } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const doctor = doctors.find((doc: Doctor) => doc.id === id);

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  return NextResponse.json(doctor);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the doctor
    const doctorIndex = doctors.findIndex((doc: Doctor) => doc.id === id);
    if (doctorIndex === -1) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.name || !body.specialization) {
      return NextResponse.json(
        { error: "Name and specialization are required fields" },
        { status: 400 }
      );
    }

    // Update the doctor (keeping the id and createdAt the same)
    const updatedDoctor: Doctor = {
      ...doctors[doctorIndex],
      name: body.name,
      specialization: body.specialization,
      email: body.email,
      phone: body.phone,
      // Don't update id or createdAt
    };

    doctors[doctorIndex] = updatedDoctor;

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: "Failed to update doctor" },
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

    // Check if doctor exists
    const doctorIndex = doctors.findIndex((doc: Doctor) => doc.id === id);
    if (doctorIndex === -1) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Remove the doctor
    doctors.splice(doctorIndex, 1);

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
