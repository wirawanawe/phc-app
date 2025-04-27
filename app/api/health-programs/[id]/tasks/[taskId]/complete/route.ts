import { NextRequest, NextResponse } from "next/server";
import { TaskModel } from "@/app/models";
import { verifyToken, getRoleFromToken } from "@/app/utils/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("phc_token")?.value;

    if (token) {
      // Verify token and check role
      const userRole = getRoleFromToken(token);

      // Block admin users from completing health program tasks
      if (userRole === "admin") {
        console.log(
          "Admin user attempted to complete a health program task - access denied"
        );
        return NextResponse.json(
          {
            error:
              "Admin users are not authorized to complete health program tasks",
          },
          { status: 403 }
        );
      }
    }

    const programId = params.id;
    const taskId = params.taskId;

    // Get user ID from session or request if available
    // This is placeholder, implement proper user auth as needed
    let userId = null;
    try {
      // Get user ID from token instead of making an additional request
      if (token) {
        const tokenData = verifyToken(token);
        if (tokenData) {
          userId = tokenData.userId;
        }
      }

      // Fallback to API call if token doesn't have user ID
      if (!userId) {
        const userResponse = await fetch("/api/users/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
        }
      }
    } catch (error) {
      console.warn("Failed to get user ID:", error);
    }

    // Find the task
    const task = await TaskModel.findByPk(taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update the task - use "inactive" status since that's what the model defines
    await task.update({
      status: "inactive", // Mark as inactive when completed
      completedAt: new Date().toISOString(),
      completedBy: userId,
    });

    // Get updated task
    const updatedTask = await TaskModel.findByPk(taskId, {
      include: ["healthProgram"],
    });

    return NextResponse.json({
      success: true,
      message: "Task marked as completed",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { error: "Failed to mark task as completed" },
      { status: 500 }
    );
  }
}
