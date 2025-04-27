import { NextRequest, NextResponse } from "next/server";
import { TaskModel } from "@/app/models";
import { Op } from "sequelize";

// GET all tasks or filter by health program ID
export async function GET(request: NextRequest) {
  try {
    // Get health program ID from query parameters if it exists
    const url = new URL(request.url);
    const healthProgramId = url.searchParams.get("healthProgramId");

    // Build query based on provided filters
    const query: any = {};
    if (healthProgramId) {
      query.healthProgramId = healthProgramId;
    }

    // Get status filter if exists
    const status = url.searchParams.get("status");
    if (status) {
      query.status = status;
    }

    // Get priority filter if exists
    const priority = url.searchParams.get("priority");
    if (priority) {
      query.priority = priority;
    }

    // Get tasks (with associations)
    const tasks = await TaskModel.findAll({
      where: query,
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: ["healthProgram"],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.healthProgramId || !body.title || !body.description) {
      return NextResponse.json(
        {
          error:
            "Health program ID, title, and description are required fields",
        },
        { status: 400 }
      );
    }

    // Create a new task
    const newTask = await TaskModel.create({
      ...body,
      status: body.status || "pending",
      priority: body.priority || "medium",
      createdAt: new Date().toISOString(),
    });

    // Get the created task with associations
    const taskWithAssociations = await TaskModel.findByPk(newTask.id, {
      include: ["healthProgram"],
    });

    return NextResponse.json(taskWithAssociations, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
