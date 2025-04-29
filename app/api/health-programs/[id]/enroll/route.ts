import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/app/models";
import { verifyToken } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("API: Enrollment request received for program ID:", params.id);

  try {
    // Make sure the ID is properly formatted
    const healthProgramId = params.id;
    console.log("API: Processing enrollment for program ID:", healthProgramId);

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
      console.log("API: Authentication token not found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(authToken);
      if (!payload || !payload.userId) {
        console.log("API: Invalid or expired token");
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }

      const userId = payload.userId;
      console.log("API: Authenticated user ID:", userId);

      // Get the participant by using userId field - Simplified query
      try {
        const [participant] = await sequelize.query(
          `SELECT id FROM participants WHERE id = ?`,
          {
            replacements: [userId],
            type: QueryTypes.SELECT,
          }
        );

        if (!participant) {
          console.log(
            "API: Participant profile not found for user ID:",
            userId
          );
          return NextResponse.json(
            { error: "Participant profile not found" },
            { status: 404 }
          );
        }

        const participantId = (participant as any).id;
        console.log("API: Found participant ID:", participantId);

        // Check if the health program exists - Simplified query
        const [program] = await sequelize.query(
          `SELECT id, status FROM health_programs WHERE id = ?`,
          {
            replacements: [healthProgramId],
            type: QueryTypes.SELECT,
          }
        );

        if (!program) {
          console.log("API: Health program not found:", healthProgramId);
          return NextResponse.json(
            { error: "Health program not found" },
            { status: 404 }
          );
        }

        if ((program as any).status !== "active") {
          console.log("API: Health program is not active:", healthProgramId);
          return NextResponse.json(
            { error: "Health program is not active" },
            { status: 400 }
          );
        }

        // Check if the participant is already enrolled in this program - Simplified query
        const [existingEnrollment] = await sequelize.query(
          `SELECT id FROM participant_enrollments WHERE participantId = ? AND healthProgramId = ?`,
          {
            replacements: [participantId, healthProgramId],
            type: QueryTypes.SELECT,
          }
        );

        if (existingEnrollment) {
          console.log("API: Participant already enrolled in this program");
          return NextResponse.json({
            success: true,
            message: "Already enrolled in this program",
            enrollmentId: (existingEnrollment as any).id,
          });
        }

        // Create a new enrollment with safe insert
        const enrollmentId = uuidv4();
        console.log("API: Creating new enrollment with ID:", enrollmentId);

        await sequelize.query(
          `INSERT INTO participant_enrollments 
           (id, participantId, healthProgramId, status, enrollmentDate, createdAt, updatedAt)
           VALUES (?, ?, ?, 'active', NOW(), NOW(), NOW())`,
          {
            replacements: [enrollmentId, participantId, healthProgramId],
            type: QueryTypes.INSERT,
          }
        );

        console.log("API: Successfully enrolled participant in program");
        return NextResponse.json({
          success: true,
          message: "Successfully enrolled in program",
          enrollmentId: enrollmentId,
        });
      } catch (dbError: any) {
        console.error("API: Database error:", dbError);

        // Handle duplicate entry errors
        if (dbError.code === "ER_DUP_ENTRY") {
          console.log(
            "API: Duplicate entry error - checking if enrollment exists"
          );

          // Check if enrollment actually exists
          const [existingEnrollment] = await sequelize.query(
            `SELECT id FROM participant_enrollments WHERE participantId = ? AND healthProgramId = ?`,
            {
              replacements: [userId, healthProgramId],
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
        }

        throw dbError; // Re-throw if not handled
      }
    } catch (tokenError) {
      console.error("API: Token verification error:", tokenError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
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
