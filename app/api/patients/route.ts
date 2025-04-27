import { Participant } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

const patients: Participant[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Anytown, USA",
    dateOfBirth: "1980-01-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
    address: "456 Oak Ave, Somewhere, USA",
    dateOfBirth: "1985-05-15",
    createdAt: new Date().toISOString(),
  },
];

// GET all patients
export async function GET() {
  return NextResponse.json(patients);
}

// POST - create a new patient
export async function POST(request: NextRequest) {
  try {
    const newPatient = await request.json();

    // Validate required fields
    if (!newPatient.name || !newPatient.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // In a real app, we would generate a unique ID
    const patient: Participant = {
      id: String(patients.length + 1),
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone || undefined,
      address: newPatient.address || undefined,
      dateOfBirth: newPatient.dateOfBirth || undefined,
      createdAt: new Date().toISOString(),
    };

    patients.push(patient);

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

// PUT - update a patient by ID
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const index = patients.findIndex((patient) => patient.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update only the fields that are allowed in the Participant interface
    patients[index] = {
      ...patients[index],
      name: updateData.name || patients[index].name,
      email: updateData.email || patients[index].email,
      phone: updateData.phone,
      address: updateData.address,
      dateOfBirth: updateData.dateOfBirth,
    };

    return NextResponse.json(patients[index]);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

// DELETE - remove a patient by ID
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Patient ID is required" },
      { status: 400 }
    );
  }

  const index = patients.findIndex((patient) => patient.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const deletedPatient = patients[index];
  patients.splice(index, 1);

  return NextResponse.json({
    message: "Patient deleted successfully",
    patient: deletedPatient,
  });
}
