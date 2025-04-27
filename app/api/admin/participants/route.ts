import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, initializeDatabase } from "@/app/models";
import { verifyToken, getRoleFromToken } from "@/app/utils/auth";

// GET all participants from the MySQL database
export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("phc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and check role
    const userRole = getRoleFromToken(token);

    // Block admin users from accessing participant data
    if (userRole === "admin") {
      console.log(
        "Admin user attempted to access participant data - access denied"
      );
      return NextResponse.json(
        { error: "Admin users are not authorized to access participant data" },
        { status: 403 }
      );
    }

    // Make sure database is initialized
    await initializeDatabase();

    const participants = await ParticipantModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

// POST create a new participant in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required fields" },
        { status: 400 }
      );
    }

    // Create participant in database
    const newParticipant = await ParticipantModel.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      identityNumber: body.identityNumber,
      insuranceId: body.insuranceId,
      insuranceNumber: body.insuranceNumber,
    });

    return NextResponse.json(newParticipant, { status: 201 });
  } catch (error) {
    console.error("Error creating participant in database:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
