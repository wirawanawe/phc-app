import { NextRequest, NextResponse } from "next/server";
import { DoctorModel, initializeDatabase } from "@/app/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;
    const doctor = await DoctorModel.findByPk(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
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

    // Find the doctor
    const doctor = await DoctorModel.findByPk(id);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Validate required fields
    if (!body.name || !body.spesialization) {
      return NextResponse.json(
        { error: "Name and specialization are required fields" },
        { status: 400 }
      );
    }

    // Update the doctor
    await doctor.update({
      name: body.name,
      spesialization: body.specialization,
      email: body.email,
      phone: body.phone,
      schedule: body.schedule,
    });

    // Fetch the updated doctor
    const updatedDoctor = await DoctorModel.findByPk(id);

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
    // Make sure database is initialized
    await initializeDatabase();

    const id = params.id;

    // Check if doctor exists
    const doctor = await DoctorModel.findByPk(id);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Remove the doctor
    await doctor.destroy();

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
