import { SpesializationModel } from "./../../../models/Spesialization";
import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/app/models";

// GET all spesialization from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const spesializations = await SpesializationModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(spesializations);
  } catch (error) {
    console.error("Error fetching spesialization from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch spesializations" },
      { status: 500 }
    );
  }
}

// POST create a new spesialization in the MySQL database
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Spesialization name are required fields" },
        { status: 400 }
      );
    }

    // Create spesialization in database
    const newSpesialization = await SpesializationModel.create({
      name: body.name,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newSpesialization, { status: 201 });
  } catch (error) {
    console.error("Error creating spesialization in database:", error);
    return NextResponse.json(
      { error: "Failed to create spesialization" },
      { status: 500 }
    );
  }
}
