import { NextRequest, NextResponse } from "next/server";
import { UserModel, ParticipantModel, initializeDatabase } from "@/app/models";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { generateToken } from "@/app/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Get request body
    const body = await request.json();
    const {
      userId,
      name,
      identityNumber,
      dateOfBirth,
      address,
      phone,
      email,
      password,
      createAccount,
    } = body;

    // Validate required fields
    if (!name || !dateOfBirth || !address || !phone || !email) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    let participantId: string;
    let newToken: string | null = null;

    // If userId is provided, use existing user account
    if (userId) {
      // Check if user exists
      const user = await UserModel.findByPk(userId);
      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check if participant with this userId already exists
      const existingParticipant = await ParticipantModel.findOne({
        where: { id: userId },
      });

      if (existingParticipant) {
        return NextResponse.json(
          { error: "User sudah terdaftar sebagai participant" },
          { status: 400 }
        );
      }

      participantId = userId;

      // Update user role to 'participant'
      await user.update({ role: "participant" });
    }
    // If creating a new account
    else if (createAccount) {
      // Validate password
      if (!password) {
        return NextResponse.json(
          { error: "Password diperlukan untuk membuat akun baru" },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "Email sudah terdaftar. Silakan login atau gunakan email lain.",
          },
          { status: 400 }
        );
      }

      // Create a new user and generate an ID
      participantId = uuidv4();

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user with participant role
      const newUser = await UserModel.create({
        id: participantId,
        email,
        password: hashedPassword,
        fullName: name,
        role: "participant",
        username: email.split("@")[0], // Generate username from email
        isActive: true,
      });

      // Generate token for auto-login
      newToken = generateToken({
        userId: newUser.id,
        role: newUser.role,
      });
    }
    // If neither userId nor createAccount is provided
    else {
      // Generate a new ID for the participant
      participantId = uuidv4();
    }

    // Create new participant
    const participant = await ParticipantModel.create({
      id: participantId,
      name,
      identityNumber,
      dateOfBirth,
      address,
      phone,
      email,
    });

    // Return response with token if new account was created
    if (newToken) {
      return NextResponse.json(
        {
          message: "Berhasil mendaftar sebagai participant",
          participant,
          token: newToken,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Berhasil mendaftar sebagai participant",
          participant,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error registering participant:", error);
    return NextResponse.json(
      { error: "Gagal mendaftar sebagai participant" },
      { status: 500 }
    );
  }
}
