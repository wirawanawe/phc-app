import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";
import { QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

interface RequestBody {
  status: "active" | "completed";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Parse request body
    const body: RequestBody = await req.json();
    const { status } = body;

    if (!status || !["active", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

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

    // Check if task exists and participant is enrolled in the associated program
    const [taskValidation] = await sequelize.query(
      `
      SELECT t.id, t.healthProgramId
      FROM tasks t
      JOIN participant_enrollments pe ON t.healthProgramId = pe.healthProgramId
      WHERE t.id = ? AND pe.participantId = ?
      `,
      {
        replacements: [taskId, participantId],
        type: QueryTypes.SELECT,
      }
    );

    if (!taskValidation) {
      return NextResponse.json(
        { error: "Task not found or you don't have access to this task" },
        { status: 404 }
      );
    }

    // Check if participant_tasks table exists, create it if it doesn't
    try {
      const [ptExists] = await sequelize.query(
        `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'participant_tasks'
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      if ((ptExists as any).count === 0) {
        // Create participant_tasks table if it doesn't exist
        await sequelize.query(`
          CREATE TABLE participant_tasks (
            id VARCHAR(36) PRIMARY KEY,
            participantId VARCHAR(36) NOT NULL,
            taskId VARCHAR(36) NOT NULL,
            status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
            completedAt DATETIME NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            FOREIGN KEY (participantId) REFERENCES participants(id) ON DELETE CASCADE,
            FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
            UNIQUE KEY task_participant_unique (taskId, participantId)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("API: Created participant_tasks table on-demand");
      }
    } catch (tableError) {
      console.error(
        "API: Error checking/creating participant_tasks table:",
        tableError
      );
      // Continue with the request even if this fails
    }

    // Check if there's already a participant_task record
    const [existingParticipantTask] = await sequelize.query(
      `
      SELECT id FROM participant_tasks 
      WHERE taskId = ? AND participantId = ?
      `,
      {
        replacements: [taskId, participantId],
        type: QueryTypes.SELECT,
      }
    );

    if (existingParticipantTask) {
      // Update existing record
      await sequelize.query(
        `
        UPDATE participant_tasks 
        SET status = ?, updatedAt = NOW() 
        WHERE taskId = ? AND participantId = ?
        `,
        {
          replacements: [status, taskId, participantId],
          type: QueryTypes.UPDATE,
        }
      );
    } else {
      // Create a new record
      await sequelize.query(
        `
        INSERT INTO participant_tasks 
        (id, taskId, participantId, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        `,
        {
          replacements: [uuidv4(), taskId, participantId, status],
          type: QueryTypes.INSERT,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task ${
        status === "completed" ? "completed" : "reactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
