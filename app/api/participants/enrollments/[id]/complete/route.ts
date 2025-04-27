import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = params.id;

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

    const payload = verifyToken(authToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Get the participant associated with this user
    const [participant] = await sequelize.query(
      `
      SELECT id FROM participants WHERE userId = ?
      `,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!participant) {
      return NextResponse.json(
        { error: "Participant profile not found" },
        { status: 404 }
      );
    }

    const participantId = (participant as any).id;

    // Check if the enrollment belongs to this participant
    const [enrollment] = await sequelize.query(
      `
      SELECT * FROM participant_enrollments 
      WHERE id = ? AND participantId = ?
      `,
      {
        replacements: [enrollmentId, participantId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found or does not belong to you" },
        { status: 404 }
      );
    }

    // Update the enrollment status to completed
    await sequelize.query(
      `
      UPDATE participant_enrollments 
      SET status = 'completed', completionDate = NOW() 
      WHERE id = ?
      `,
      {
        replacements: [enrollmentId],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Program marked as completed successfully",
    });
  } catch (error) {
    console.error("Error completing program:", error);
    return NextResponse.json(
      { error: "Failed to complete program" },
      { status: 500 }
    );
  }
}
