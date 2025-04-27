import { NextRequest, NextResponse } from "next/server";
import { UserModel, ParticipantModel, initializeDatabase } from "@/app/models";
import sequelize from "@/app/config/db.config";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get request body
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      username,
      identityNumber,
      insuranceId,
      insuranceNumber,
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await ParticipantModel.findOne({
        where: { phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
    }

    // Check if identityNumber already exists (if provided)
    if (identityNumber) {
      const existingIdentity = await ParticipantModel.findOne({
        where: { identityNumber },
      });
      if (existingIdentity) {
        return NextResponse.json(
          { error: "Identity number already in use" },
          { status: 400 }
        );
      }
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await UserModel.findOne({ where: { username } });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already in use" },
          { status: 400 }
        );
      }
    }

    // Generate a username if not provided
    const finalUsername =
      username || email.split("@")[0] + "_" + Date.now().toString().slice(-4);

    // Use a transaction to ensure both User and Participant are created
    const transaction = await sequelize.transaction();

    try {
      // Create new user with role 'participant'
      const newUser = await UserModel.create(
        {
          username: finalUsername,
          email,
          fullName: name,
          password, // This will be hashed by the model hook
          role: "participant",
          isActive: true,
        },
        { transaction }
      );

      // Create new participant record linked to the user
      const newParticipant = await ParticipantModel.create(
        {
          id: newUser.id, // Use the same ID as the user
          name,
          email,
          phone: phone || null,
          identityNumber: identityNumber || null,
          insuranceId: insuranceId || null,
          insuranceNumber: insuranceNumber || null,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Return success response (without password)
      const userData = newUser.get({ plain: true });
      delete userData.password;

      return NextResponse.json(
        {
          message: "Registration successful",
          user: userData,
        },
        { status: 201 }
      );
    } catch (error) {
      // Rollback transaction if error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
