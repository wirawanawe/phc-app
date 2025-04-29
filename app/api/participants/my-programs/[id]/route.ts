import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";
import { QueryTypes } from "sequelize";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const programId = params.id;

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

    // Fetch the specified program and check if the participant is enrolled
    const [enrollment] = await sequelize.query(
      `
      SELECT 
        hp.id AS programId,
        hp.name,
        hp.description,
        hp.startDate,
        hp.endDate,
        hp.status AS programStatus,
        pe.id AS enrollmentId,
        pe.status AS enrollmentStatus,
        pe.enrollmentDate,
        pe.completionDate,
        pc.id AS categoryId,
        pc.name AS categoryName,
        pc.color AS categoryColor
      FROM participant_enrollments pe
      JOIN health_programs hp ON pe.healthProgramId = hp.id
      LEFT JOIN program_categories pc ON hp.categoryId = pc.id
      WHERE pe.participantId = ? AND hp.id = ?
      `,
      {
        replacements: [participantId, programId],
        type: QueryTypes.SELECT,
      }
    );

    if (!enrollment) {
      return NextResponse.json(
        { error: "Program not found or you are not enrolled in this program" },
        { status: 404 }
      );
    }

    // Fetch tasks for this program
    let tasks: any[] = [];
    try {
      // First check if participant_tasks table exists
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

      const participantTasksExist = (ptExists as any).count > 0;

      // Use appropriate query based on whether participant_tasks table exists
      if (participantTasksExist) {
        // If table exists, use the original query with LEFT JOIN
        const taskResults = await sequelize.query(
          `
          SELECT 
            t.id, 
            t.title, 
            t.description, 
            t.priority,
            t.timePerformed,
            COALESCE(pt.status, t.status) AS status
          FROM tasks t
          LEFT JOIN participant_tasks pt ON t.id = pt.taskId AND pt.participantId = ?
          WHERE t.healthProgramId = ?
          ORDER BY 
            CASE 
              WHEN COALESCE(pt.status, t.status) = 'active' THEN 0
              ELSE 1
            END,
            t.priority = 'high' DESC,
            t.priority = 'medium' DESC,
            t.priority = 'low' DESC,
            t.title
          `,
          {
            replacements: [participantId, programId],
            type: QueryTypes.SELECT,
          }
        );
        tasks = taskResults;
      } else {
        // If table doesn't exist, use a simpler query without LEFT JOIN
        const taskResults = await sequelize.query(
          `
          SELECT 
            t.id, 
            t.title, 
            t.description, 
            t.priority,
            t.timePerformed,
            t.status
          FROM tasks t
          WHERE t.healthProgramId = ?
          ORDER BY 
            CASE 
              WHEN t.status = 'active' THEN 0
              ELSE 1
            END,
            t.priority = 'high' DESC,
            t.priority = 'medium' DESC,
            t.priority = 'low' DESC,
            t.title
          `,
          {
            replacements: [programId],
            type: QueryTypes.SELECT,
          }
        );
        tasks = taskResults;
      }
    } catch (taskError) {
      console.error("API: Error fetching tasks:", taskError);
      // If there's an error, just set tasks to empty array
      tasks = [];
    }

    // Calculate progress
    const totalTasks = tasks.length;
    const completedTasks = (tasks as any[]).filter(
      (task) => task.status === "completed"
    ).length;

    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Determine combined status (from program and enrollment)
    let status = (enrollment as any).enrollmentStatus;
    if (status === "active" && (enrollment as any).programStatus !== "active") {
      status = (enrollment as any).programStatus;
    }

    const programDetail = {
      id: (enrollment as any).programId,
      enrollmentId: (enrollment as any).enrollmentId,
      name: (enrollment as any).name,
      description: (enrollment as any).description,
      startDate: (enrollment as any).startDate,
      endDate: (enrollment as any).endDate,
      status: status,
      progress,
      totalTasks,
      completedTasks,
      enrollmentDate: (enrollment as any).enrollmentDate,
      completionDate: (enrollment as any).completionDate,
      category: (enrollment as any).categoryId
        ? {
            id: (enrollment as any).categoryId,
            name: (enrollment as any).categoryName,
            color: (enrollment as any).categoryColor,
          }
        : null,
      tasks: tasks,
    };

    return NextResponse.json(programDetail);
  } catch (error) {
    console.error("Error fetching program details:", error);
    return NextResponse.json(
      { error: "Failed to fetch program details" },
      { status: 500 }
    );
  }
}
