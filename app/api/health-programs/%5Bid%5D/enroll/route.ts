import { NextRequest, NextResponse } from "next/server";
import {
  initializeDatabase,
  HealthProgramModel,
  ParticipantModel,
} from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";
import { QueryTypes } from "sequelize";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get token from cookie
    const token = req.cookies.get("phc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Get participant ID from request body or use user ID from token
    const body = await req.json();
    const participantId = body.participantId || payload.userId;

    // Check if health program exists
    const healthProgram = await HealthProgramModel.findByPk(params.id);
    if (!healthProgram) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // Check if participant exists
    const participant = await ParticipantModel.findByPk(participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled using raw SQL
    const [existingEnrollment] = await sequelize.query(
      `
      SELECT * FROM participant_enrollments 
      WHERE participantId = ? AND healthProgramId = ?
      `,
      {
        replacements: [participantId, params.id],
        type: QueryTypes.SELECT,
      }
    );

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this program" },
        { status: 400 }
      );
    }

    // Create enrollment using raw SQL
    await sequelize.query(
      `
      INSERT INTO participant_enrollments (participantId, healthProgramId, enrollmentDate, status)
      VALUES (?, ?, NOW(), 'active')
      `,
      {
        replacements: [participantId, params.id],
        type: QueryTypes.INSERT,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in health program",
    });
  } catch (error) {
    console.error("API: Error enrolling in health program:", error);
    return NextResponse.json(
      { error: "Failed to enroll in health program" },
      { status: 500 }
    );
  }
}
