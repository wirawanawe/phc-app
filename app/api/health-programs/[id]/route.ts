import { NextRequest, NextResponse } from "next/server";
import {
  HealthProgramModel,
  ProgramCategoryModel,
  TaskModel,
  initializeDatabase,
} from "@/app/models";
import { verifyToken, getRoleFromToken } from "@/app/utils/auth";

// GET a specific health program
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

      // Block admin users from accessing health program data
      if (userRole === "admin") {
        console.log(
          "Admin user attempted to access health program detail - access denied"
        );
        return NextResponse.json(
          {
            error:
              "Admin users are not authorized to access health program data",
          },
          { status: 403 }
        );
      }
    }

    // Initialize database
    await initializeDatabase();

    const id = await params.id;

    // Get the health program with its category
    const program = await HealthProgramModel.findByPk(id, {
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "description", "color"],
        },
        {
          model: TaskModel,
          as: "tasks",
          attributes: [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "timePerformed",
          ],
        },
      ],
    });

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // Clean up the data before sending it
    const plainProgram = program.get({ plain: true }) as any;

    // Make sure category is properly formatted if it exists
    if (plainProgram.category) {
      plainProgram.category = {
        id: plainProgram.category.id || "",
        name: plainProgram.category.name || "Uncategorized",
        description: plainProgram.category.description || "",
        color: plainProgram.category.color || "#E32345",
      };
    }

    return NextResponse.json(plainProgram);
  } catch (error) {
    console.error("Error fetching health program:", error);
    return NextResponse.json(
      { error: "Failed to fetch health program" },
      { status: 500 }
    );
  }
}

// PUT update an existing health program
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Find the program by ID
    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // If categoryId is provided, verify that the category exists
    if (body.categoryId && body.categoryId !== program.categoryId) {
      const categoryExists = await ProgramCategoryModel.findByPk(
        body.categoryId
      );
      if (!categoryExists) {
        return NextResponse.json(
          { error: "The specified category does not exist" },
          { status: 400 }
        );
      }
    }

    // Update the program
    await program.update(body);

    // Get the updated program with category
    const updatedProgram = await HealthProgramModel.findByPk(id, {
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "description", "color"],
        },
      ],
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating health program:", error);
    return NextResponse.json(
      { error: "Failed to update health program" },
      { status: 500 }
    );
  }
}

// DELETE a health program
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Find the program by ID
    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // Delete the program
    await program.destroy();

    return NextResponse.json(
      { message: "Health program deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting health program:", error);
    return NextResponse.json(
      { error: "Failed to delete health program" },
      { status: 500 }
    );
  }
}
