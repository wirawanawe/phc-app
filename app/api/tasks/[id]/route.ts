import { NextRequest, NextResponse } from "next/server";
import { TaskModel } from "@/app/models";

// GET a single task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Find the task by ID
    const task = await TaskModel.findByPk(id, {
      include: ["healthProgram"],
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT update an existing task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the task by ID
    const task = await TaskModel.findByPk(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Handle completion logic
    if (body.status === "completed" && task.status !== "completed") {
      body.completedAt = new Date().toISOString();
      if (body.completedBy) {
        body.completedBy = body.completedBy;
      }
    }

    // If moving from completed to another status, clear completion fields
    if (task.status === "completed" && body.status !== "completed") {
      body.completedAt = null;
      body.completedBy = null;
    }

    // Update the task
    await task.update(body);

    // Get the updated task with associations
    const updatedTask = await TaskModel.findByPk(id, {
      include: ["healthProgram"],
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Find the task by ID
    const task = await TaskModel.findByPk(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete the task
    await task.destroy();

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
