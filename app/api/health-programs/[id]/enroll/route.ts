import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure the ID is properly formatted
    const healthProgramId = params.id;

    // Get request body data
    const reqData = await req.json().catch(() => ({}));
    const { participantId: requestParticipantId, email } = reqData;

    // Get token from cookie if available (but not required)
    const token = req.cookies.get("phc_token")?.value;
    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const authToken = token || headerToken;

    let participantId = null;

    // Try to get participantId from different sources with fallbacks
    if (requestParticipantId) {
      // If participantId provided directly in request, use it (highest priority)
      participantId = requestParticipantId;
    } else if (authToken) {
      // If auth token available, try to extract userId
      try {
        const payload = verifyToken(authToken);
        if (payload && payload.userId) {
          // Check if user has a participant profile
          const [participant] = await sequelize.query(
            `SELECT id FROM participants WHERE id = ?`,
            {
              replacements: [payload.userId],
              type: QueryTypes.SELECT,
            }
          );

          if (participant) {
            participantId = (participant as any).id;
          }
        }
      } catch (tokenError) {
        // Token verification error, continue with alternate methods
      }
    } else if (email) {
      // Try to find participant by email if no token available
      const [participant] = await sequelize.query(
        `SELECT id FROM participants WHERE email = ?`,
        {
          replacements: [email],
          type: QueryTypes.SELECT,
        }
      );

      if (participant) {
        participantId = (participant as any).id;
      }
    }

    // If no participant ID found by any method, create a guest enrollment
    if (!participantId) {
      participantId = uuidv4();
    }

    // Check if the health program exists and is active
    const [program] = await sequelize.query(
      `SELECT id, status, maxParticipants, startDate FROM health_programs WHERE id = ?`,
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

    if ((program as any).status !== "active") {
      return NextResponse.json(
        { error: "Health program is not active" },
        { status: 400 }
      );
    }

    // Check if program has reached maximum participant limit
    if ((program as any).maxParticipants) {
      const [enrollmentCount] = await sequelize.query(
        `SELECT COUNT(*) as count FROM participant_enrollments WHERE healthProgramId = ? AND status = 'active'`,
        {
          replacements: [healthProgramId],
          type: QueryTypes.SELECT,
        }
      );

      if ((enrollmentCount as any).count >= (program as any).maxParticipants) {
        return NextResponse.json(
          { error: "Program has reached maximum enrollment limit" },
          { status: 400 }
        );
      }
    }

    // Check if the participant is already enrolled in this program
    const [existingEnrollment] = await sequelize.query(
      `SELECT id FROM participant_enrollments WHERE participantId = ? AND healthProgramId = ?`,
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
        participantId: participantId,
      });
    }

    // Create a new enrollment with safe insert
    const enrollmentId = uuidv4();

    await sequelize.query(
      `INSERT INTO participant_enrollments 
       (id, participantId, healthProgramId, status, enrollmentDate, createdAt, updatedAt)
       VALUES (?, ?, ?, 'active', NOW(), NOW(), NOW())`,
      {
        replacements: [enrollmentId, participantId, healthProgramId],
        type: QueryTypes.INSERT,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in program",
      enrollmentId: enrollmentId,
      participantId: participantId,
    });
  } catch (error: any) {
    console.error("API: Global error during enrollment:", error);

    // Return a more detailed error for debugging
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enroll in program",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
