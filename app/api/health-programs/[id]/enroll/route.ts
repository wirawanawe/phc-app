import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use await to make params asynchronous
    const healthProgramId = await Promise.resolve(params.id);

    // Get token from cookie
    const token = req.cookies.get("phc_token")?.value;

    // If no token in cookie, check header as fallback
    const authHeader = req.headers.get("authorization");
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    // Use token from cookie or header
    const authToken = token || headerToken;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate that authToken is a proper JWT format before verifying
    if (
      !authToken.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/)
    ) {
      console.error("Invalid token format");
      return NextResponse.json(
        { error: "Invalid authentication token format" },
        { status: 401 }
      );
    }

    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Fix the query to find the participant by using userId field properly
    // Since participant is the user itself (id is the same), use userId directly
    const [participant] = await sequelize.query(
      `
      SELECT id FROM participants WHERE id = ?
      `,
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      }
    );

    if (!participant) {
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      );
    }

    const participantId = (participant as any).id;

    // Check if the health program exists
    const [program] = await sequelize.query(
      `
      SELECT * FROM health_programs WHERE id = ?
      `,
      {
        replacements: [healthProgramId],
        type: QueryTypes.SELECT,
      }
    );

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // Check if the participant is already enrolled in this program
    const [existingEnrollment] = await sequelize.query(
      `
      SELECT * FROM participant_enrollments 
      WHERE participantId = ? AND healthProgramId = ?
      `,
      {
        replacements: [participantId, healthProgramId],
        type: QueryTypes.SELECT,
      }
    );

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: "Already enrolled in this program",
        enrollmentId: (existingEnrollment as any).id,
      });
    }

    // Create a new enrollment
    const enrollmentId = uuidv4();
    await sequelize.query(
      `
      INSERT INTO participant_enrollments 
      (id, participantId, healthProgramId, status, enrollmentDate, createdAt, updatedAt)
      VALUES (?, ?, ?, 'active', NOW(), NOW(), NOW())
      `,
      {
        replacements: [enrollmentId, participantId, healthProgramId],
        type: QueryTypes.INSERT,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in program",
      enrollmentId: enrollmentId,
    });
  } catch (error) {
    console.error("Error enrolling in program:", error);
    return NextResponse.json(
      { error: "Failed to enroll in program" },
      { status: 500 }
    );
  }
}
