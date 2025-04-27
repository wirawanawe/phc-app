import { NextRequest, NextResponse } from "next/server";
import { SpesializationModel, initializeDatabase } from "@/app/models";

// GET a specific specialization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const specialization = await SpesializationModel.findByPk(id);

    if (!specialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(specialization);
  } catch (error) {
    console.error("Error fetching specialization:", error);
    return NextResponse.json(
      { error: "Failed to fetch specialization" },
      { status: 500 }
    );
  }
}

// PUT update a specialization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const body = await request.json();

    // Find the specialization
    const specialization = await SpesializationModel.findByPk(id);
    if (!specialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    // Update the specialization
    await specialization.update({
      name: body.name,
      isActive: body.isActive,
    });

    return NextResponse.json(specialization);
  } catch (error) {
    console.error("Error updating specialization:", error);
    return NextResponse.json(
      { error: "Failed to update specialization" },
      { status: 500 }
    );
  }
}

// DELETE a specialization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;

    // Find the specialization
    const specialization = await SpesializationModel.findByPk(id);
    if (!specialization) {
      return NextResponse.json(
        { error: "Specialization not found" },
        { status: 404 }
      );
    }

    // Delete the specialization
    await specialization.destroy();

    return NextResponse.json(
      { message: "Specialization deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting specialization:", error);
    return NextResponse.json(
      { error: "Failed to delete specialization" },
      { status: 500 }
    );
  }
}
