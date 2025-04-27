import { NextRequest, NextResponse } from "next/server";
import { UserModel, ParticipantModel, initializeDatabase } from "@/app/models";

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Get request body
    const body = await request.json();
    const { userId, name, identityNumber, dateOfBirth, address, phone, email } =
      body;

    // Validate required fields
    if (!userId || !name || !dateOfBirth || !address || !phone || !email) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

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

    // Create new participant
    const participant = await ParticipantModel.create({
      id: userId, // Use the same ID as the user for one-to-one relationship
      name,
      identityNumber,
      dateOfBirth,
      address,
      phone,
      email,
    });

    // Update user role to 'participant'
    await user.update({ role: "participant" });

    return NextResponse.json(
      {
        message: "Berhasil mendaftar sebagai participant",
        participant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering participant:", error);
    return NextResponse.json(
      { error: "Gagal mendaftar sebagai participant" },
      { status: 500 }
    );
  }
}
