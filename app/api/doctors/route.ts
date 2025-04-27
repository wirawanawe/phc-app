import { NextRequest, NextResponse } from "next/server";
import { Doctor } from "@/app/types";
import { DoctorModel, initializeDatabase } from "@/app/models";

// Mock database - in a real app, this would be your database
const doctors: Doctor[] = [
  {
    id: "doctor_1",
    name: "Dr. Jane Smith",
    specialization: "Cardiologist",
    email: "jane.smith@example.com",
    phone: "123-456-7890",
    createdAt: new Date().toISOString(),
  },
  {
    id: "doctor_2",
    name: "Dr. John Doe",
    specialization: "Pediatrician",
    email: "john.doe@example.com",
    phone: "123-456-7891",
    createdAt: new Date().toISOString(),
  },
];

// GET all doctors
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Fetch all doctors
    const doctors = await DoctorModel.findAll({
      attributes: ["id", "name", "specialization", "email", "phone"],
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST create a new doctor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.specialization) {
      return NextResponse.json(
        { error: "Name and specialization are required fields" },
        { status: 400 }
      );
    }

    // Create a new doctor
    const newDoctor: Doctor = {
      id: "doctor_" + Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    // Add to our mock database
    doctors.push(newDoctor);

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
