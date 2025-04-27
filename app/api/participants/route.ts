import { NextRequest, NextResponse } from "next/server";
import { ParticipantModel, UserModel, initializeDatabase } from "@/app/models";
import sequelize from "@/app/config/db.config";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// GET all participants
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Fetch all participants
    const participants = await ParticipantModel.findAll({
      attributes: ["id", "name", "email", "phone"],
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

// POST create a new participant
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

    // Check if participant with the same email already exists
    const existingParticipant = await ParticipantModel.findOne({
      where: { email: body.email },
    });

    // If participant exists, return that participant
    if (existingParticipant) {
      return NextResponse.json(existingParticipant, { status: 200 });
    }

    // Check if phone number already exists (if provided)
    if (body.phone) {
      const existingPhone = await ParticipantModel.findOne({
        where: { phone: body.phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
    }

    // Check if identity number already exists (if provided)
    if (body.identityNumber) {
      const existingIdentity = await ParticipantModel.findOne({
        where: { identityNumber: body.identityNumber },
      });
      if (existingIdentity) {
        return NextResponse.json(
          { error: "Identity number already in use" },
          { status: 400 }
        );
      }
    }

    // Check if user with the same email already exists
    const existingUser = await UserModel.findOne({
      where: { email: body.email },
    });

    // Start a transaction to ensure both records are created or none
    const transaction = await sequelize.transaction();

    try {
      // Create new participant
      const newParticipant = await ParticipantModel.create(
        {
          name: body.name,
          email: body.email,
          phone: body.phone,
          identityNumber: body.identityNumber,
          insuranceId: body.insuranceId,
          insuranceNumber: body.insuranceNumber,
        },
        { transaction }
      );

      let username = "";
      // If user doesn't exist, create a new user
      if (!existingUser) {
        // Use provided username or generate one based on email
        username =
          body.username ||
          body.email.split("@")[0] + "_" + Date.now().toString().slice(-4);

        // Use provided password or generate a random one
        const password = body.password || uuidv4().slice(0, 8);

        // Create the user with role 'participant'
        await UserModel.create(
          {
            username,
            email: body.email,
            fullName: body.name,
            password, // This will be hashed by the model hook
            role: "participant",
            isActive: true,
          },
          { transaction }
        );
      }

      // Commit the transaction
      await transaction.commit();

      return NextResponse.json(
        {
          participant: newParticipant,
          newUserCreated: !existingUser,
          tempUsername: !existingUser && !body.username ? username : undefined,
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback the transaction if something fails
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
