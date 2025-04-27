import { NextRequest, NextResponse } from "next/server";
import {
  HealthProgramModel,
  ProgramCategoryModel,
  initializeDatabase,
  sequelize,
} from "@/app/models";
import { QueryTypes } from "sequelize";

// GET a single health program by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Tidak perlu await di sini karena params.id sudah string
    const id = params.id;

    const program = await HealthProgramModel.findByPk(id, {
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching health program from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch health program" },
      { status: 500 }
    );
  }
}

// PUT update a health program in the database
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Tidak perlu await di sini karena params.id sudah string
    const id = params.id;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.startDate) {
      return NextResponse.json(
        { error: "Name, description, and start date are required fields" },
        { status: 400 }
      );
    }

    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // Update program
    await program.update({
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      startDate: body.startDate,
      endDate: body.endDate,
      location: body.location,
      maxParticipants: body.maxParticipants,
      status: body.status,
    });

    // Fetch the updated program with its category
    const updatedProgram = await HealthProgramModel.findByPk(id, {
      include: [
        {
          model: ProgramCategoryModel,
          as: "category",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating health program in database:", error);
    return NextResponse.json(
      { error: "Failed to update health program" },
      { status: 500 }
    );
  }
}

// DELETE a health program from the database
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Tidak perlu await di sini karena params.id sudah string
    const id = params.id;

    const program = await HealthProgramModel.findByPk(id);

    if (!program) {
      return NextResponse.json(
        { error: "Health program not found" },
        { status: 404 }
      );
    }

    // First check if there are any participant enrollments
    try {
      // Check if there are any enrollments for this program
      const result = await sequelize.query(
        `
        SELECT COUNT(*) AS enrollmentCount 
        FROM participant_enrollments 
        WHERE healthProgramId = ?
        `,
        {
          replacements: [id],
          type: QueryTypes.SELECT,
        }
      );

      const enrollmentCount = (result[0] as { enrollmentCount: number })
        .enrollmentCount;

      // If enrollments exist, remove them first
      if (enrollmentCount > 0) {
        await sequelize.query(
          `
          DELETE FROM participant_enrollments 
          WHERE healthProgramId = ?
          `,
          {
            replacements: [id],
            type: QueryTypes.DELETE,
          }
        );
        console.log(`Deleted ${enrollmentCount} enrollments for program ${id}`);
      }

      // Check if there are any tasks for this program
      const taskResult = await sequelize.query(
        `
        SELECT COUNT(*) AS taskCount 
        FROM tasks 
        WHERE healthProgramId = ?
        `,
        {
          replacements: [id],
          type: QueryTypes.SELECT,
        }
      );

      const taskCount = (taskResult[0] as { taskCount: number }).taskCount;

      // If tasks exist, delete them directly
      // Skip trying to delete from participant_tasks since the table doesn't exist
      if (taskCount > 0) {
        // Delete the tasks directly
        await sequelize.query(
          `
          DELETE FROM tasks 
          WHERE healthProgramId = ?
          `,
          {
            replacements: [id],
            type: QueryTypes.DELETE,
          }
        );
        console.log(`Deleted ${taskCount} tasks for program ${id}`);
      }

      // Now delete the program itself
      await program.destroy();
      return NextResponse.json({
        success: true,
        message: "Health program successfully deleted",
      });
    } catch (deleteError: any) {
      console.error("Error deleting related data:", deleteError);
      return NextResponse.json(
        {
          error: "Failed to delete health program and related data",
          details: deleteError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error deleting health program from database:", error);
    return NextResponse.json(
      {
        error: "Failed to delete health program",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
