import { NextRequest, NextResponse } from "next/server";
import { TaskModel } from "@/app/models";
import { verifyToken, getRoleFromToken } from "@/app/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("phc_token")?.value;

    if (token) {
      // Verify token and check role
      const userRole = getRoleFromToken(token);

      // Block admin users from accessing health program tasks
      if (userRole === "admin") {
        console.log(
          "Admin user attempted to access health program tasks - access denied"
        );
        return NextResponse.json(
          {
            error:
              "Admin users are not authorized to access health program tasks",
          },
          { status: 403 }
        );
      }
    }

    const programId = params.id;

    // Fetch tasks from database for this health program
    const tasks = await TaskModel.findAll({
      where: {
        healthProgramId: programId,
      },
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: ["healthProgram"],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tasks" },
      { status: 500 }
    );
  }
}
