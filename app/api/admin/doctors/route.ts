import { NextRequest, NextResponse } from "next/server";
import { DoctorModel, initializeDatabase } from "@/app/models";
import { QueryTypes } from "sequelize";
import sequelize from "@/app/config/db.config";
import { verifyToken } from "@/app/utils/auth";

// GET all doctors from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    try {
      // First try with all attributes
      const doctors = await DoctorModel.findAll({
        order: [["createdAt", "DESC"]],
      });
      return NextResponse.json(doctors);
    } catch (dbError: any) {
      console.error("Error details:", {
        message: dbError.message,
        name: dbError.name,
        original: dbError.original,
        sql: dbError.sql,
      });

      // Use raw SQL as a fallback to avoid column name issues
      const rawDoctors = await sequelize.query(
        `SELECT 
          id, 
          name, 
          specialization as spesialization, 
          email, 
          phone, 
          schedule, 
          createdAt, 
          updatedAt 
        FROM doctors 
        ORDER BY createdAt DESC`,
        { type: QueryTypes.SELECT }
      );

      return NextResponse.json(rawDoctors);
    }
  } catch (error) {
    console.error("Error fetching doctors from database:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// POST create a new doctor in the MySQL database
export async function POST(req: NextRequest) {
  try {
    // Initialize database
    await initializeDatabase();

    // Get token from cookie
    const token = req.cookies.get("phc_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.spesialisasiId) {
      return NextResponse.json(
        { error: "Name and specialization are required fields" },
        { status: 400 }
      );
    }

    try {
      // Create doctor in database with schedule
      const newDoctor = await DoctorModel.create({
        name: body.name,
        spesialization: body.spesialisasiId,
        email: body.email,
        phone: body.phone,
        schedule: body.schedule,
      });

      return NextResponse.json(newDoctor, { status: 201 });
    } catch (dbError: any) {
      console.error("Error creating doctor:", dbError);
      // If there's a specific error about missing column
      if (
        dbError?.original?.code === "ER_BAD_FIELD_ERROR" &&
        dbError?.original?.sqlMessage?.includes("Unknown column 'schedule'")
      ) {
        // Fallback to creating without the schedule field
        const newDoctor = await DoctorModel.create({
          name: body.name,
          spesialization: body.spesialisasiId,
          email: body.email,
          phone: body.phone,
        });

        return NextResponse.json(newDoctor, { status: 201 });
      } else {
        // For other database errors, rethrow
        throw dbError;
      }
    }
  } catch (error) {
    console.error("Error creating doctor in database:", error);
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
