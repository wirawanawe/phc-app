import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";
import { sequelize } from "@/app/models";

export async function GET(req: NextRequest) {
  console.log("API: Received request to fetch enrolled programs");
  try {
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

    // Log authentication info (without exposing full token)
    console.log("API: Authentication - Cookie token exists:", !!token);
    console.log("API: Authentication - Header token exists:", !!headerToken);

    if (!authToken) {
      console.log("API: No authentication token found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(authToken);
      if (!payload || !payload.userId) {
        console.log("API: Invalid token or missing userId in payload");
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }

      const userId = payload.userId;
      console.log("API: Authenticated user ID:", userId);

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
        console.log("API: No participant profile found for user ID:", userId);
        return NextResponse.json(
          { error: "Participant profile not found" },
          { status: 404 }
        );
      }

      const participantId = (participant as any).id;
      console.log("API: Found participant ID:", participantId);

      // Fetch all enrolled programs for this participant
      const enrollments = await sequelize.query(
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
        WHERE pe.participantId = ?
        ORDER BY pe.enrollmentDate DESC
        `,
        {
          replacements: [participantId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      console.log(
        "API: Found enrollments count:",
        (enrollments as any[]).length
      );

      // For each program, fetch the tasks and calculate progress
      const programsWithProgress = await Promise.all(
        (enrollments as any[]).map(async (enrollment) => {
          // Fetch tasks for this program
          const tasks = await sequelize.query(
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
            `,
            {
              replacements: [participantId, enrollment.programId],
              type: sequelize.QueryTypes.SELECT,
            }
          );

          // Calculate progress
          const totalTasks = tasks.length;
          const completedTasks = (tasks as any[]).filter(
            (task) => task.status === "completed"
          ).length;

          const progress =
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

          // Determine combined status (from program and enrollment)
          let status = enrollment.enrollmentStatus;
          if (status === "active" && enrollment.programStatus !== "active") {
            status = enrollment.programStatus;
          }

          return {
            id: enrollment.programId,
            enrollmentId: enrollment.enrollmentId,
            name: enrollment.name,
            description: enrollment.description,
            startDate: enrollment.startDate,
            endDate: enrollment.endDate,
            status: status,
            progress,
            totalTasks,
            completedTasks,
            enrollmentDate: enrollment.enrollmentDate,
            completionDate: enrollment.completionDate,
            category: enrollment.categoryId
              ? {
                  id: enrollment.categoryId,
                  name: enrollment.categoryName,
                  color: enrollment.categoryColor,
                }
              : null,
            tasks: tasks,
          };
        })
      );

      console.log(
        "API: Processed programs count:",
        programsWithProgress.length
      );
      return NextResponse.json(programsWithProgress);
    } catch (tokenError) {
      console.error("API: Token verification error:", tokenError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("API: Error fetching enrolled programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled programs" },
      { status: 500 }
    );
  }
}
