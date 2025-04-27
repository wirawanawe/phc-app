import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, initializeDatabase } from "@/app/models";
import { Op } from "sequelize";

export async function GET(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get user ID from request headers (set by client)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID is required" },
        { status: 401 }
      );
    }

    // Find participant by user ID (same as participant ID)
    const participant = await ParticipantModel.findByPk(userId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Return participant data
    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID is required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      name,
      phone,
      dateOfBirth,
      address,
      identityNumber,
      insuranceId,
      insuranceNumber,
    } = body;

    // Find participant by user ID
    const participant = await ParticipantModel.findByPk(userId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if phone number is already used by another participant
    if (phone && phone !== participant.phone) {
      const existingPhone = await ParticipantModel.findOne({
        where: {
          phone,
          id: { [Op.ne]: userId }, // Exclude current participant
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already in use by another participant" },
          { status: 400 }
        );
      }
    }

    // Check if identity number is already used by another participant
    if (identityNumber && identityNumber !== participant.identityNumber) {
      const existingIdentity = await ParticipantModel.findOne({
        where: {
          identityNumber,
          id: { [Op.ne]: userId }, // Exclude current participant
        },
      });

      if (existingIdentity) {
        return NextResponse.json(
          { error: "Identity number already in use by another participant" },
          { status: 400 }
        );
      }
    }

    // Update participant data
    await participant.update({
      name: name || participant.name,
      phone: phone !== undefined ? phone : participant.phone,
      dateOfBirth:
        dateOfBirth !== undefined ? dateOfBirth : participant.dateOfBirth,
      address: address !== undefined ? address : participant.address,
      identityNumber:
        identityNumber !== undefined
          ? identityNumber
          : participant.identityNumber,
      insuranceId:
        insuranceId !== undefined ? insuranceId : participant.insuranceId,
      insuranceNumber:
        insuranceNumber !== undefined
          ? insuranceNumber
          : participant.insuranceNumber,
    });

    // Return updated participant data
    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant data" },
      { status: 500 }
    );
  }
}
