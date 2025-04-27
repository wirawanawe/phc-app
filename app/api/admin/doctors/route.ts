import { NextRequest, NextResponse } from "next/server";
import { DoctorModel, initializeDatabase } from "@/app/models";
import { QueryTypes } from "sequelize";
import sequelize from "@/app/config/db.config";

// GET all doctors from the MySQL database
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    try {
      // First try with all attributes
      console.log("Attempting to fetch all doctors");
      const doctors = await DoctorModel.findAll({
        order: [["createdAt", "DESC"]],
      });
      console.log(`Successfully fetched ${doctors.length} doctors`);
      return NextResponse.json(doctors);
    } catch (dbError: any) {
      console.error("Error details:", {
        message: dbError.message,
        name: dbError.name,
        original: dbError.original,
        sql: dbError.sql,
      });

      console.log("Using raw SQL fallback query");
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

      console.log(`SQL query fetched ${rawDoctors.length} doctors`);
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
export async function POST(request: NextRequest) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const body = await request.json();
    console.log("POST /api/admin/doctors - Request body:", body);

    // Validate required fields
    if (!body.name || !body.spesialisasiId) {
      console.log("Validation failed: Name or specialization missing", {
        name: body.name,
        spesialisasiId: body.spesialisasiId,
      });
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

      console.log("Doctor created successfully:", newDoctor.toJSON());
      return NextResponse.json(newDoctor, { status: 201 });
    } catch (dbError: any) {
      console.error("Error creating doctor:", dbError);
      // If there's a specific error about missing column
      if (
        dbError?.original?.code === "ER_BAD_FIELD_ERROR" &&
        dbError?.original?.sqlMessage?.includes("Unknown column 'schedule'")
      ) {
        console.warn(
          "Schedule column not found in doctors table. Creating doctor without schedule field."
        );

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
