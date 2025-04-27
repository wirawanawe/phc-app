import { NextResponse } from "next/server";
import { SpesializationModel, initializeDatabase } from "@/app/models";

// GET all specializations from the MySQL database for public access
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const specializations = await SpesializationModel.findAll({
      where: {
        isActive: true,
      },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return NextResponse.json(specializations);
  } catch (error) {
    console.error("Error fetching specializations from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch specializations" },
      { status: 500 }
    );
  }
}
