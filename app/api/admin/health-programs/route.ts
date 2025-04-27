import { NextRequest, NextResponse } from "next/server";
import {
  HealthProgramModel,
  ProgramCategoryModel,
  initializeDatabase,
} from "@/app/models";

// GET all health programs from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const programs = await HealthProgramModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching health programs from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch health programs" },
      { status: 500 }
    );
  }
}

// POST create a new health program in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.startDate) {
      return NextResponse.json(
        { error: "Name, description, and start date are required fields" },
        { status: 400 }
      );
    }

    // Create health program in database
    const newProgram = await HealthProgramModel.create({
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      startDate: body.startDate,
      endDate: body.endDate,
      location: body.location,
      maxParticipants: body.maxParticipants,
      status: body.status || "active",
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Error creating health program in database:", error);
    return NextResponse.json(
      { error: "Failed to create health program" },
      { status: 500 }
    );
  }
}
