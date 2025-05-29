import { NextResponse } from "next/server";
import {
  DoctorModel,
  SpesializationModel,
  initializeDatabase,
} from "@/app/models";
import { QueryTypes } from "sequelize";
import sequelize from "@/app/config/db.config";

// Define interface for availability days
type DayName = "Sen" | "Sel" | "Rab" | "Kam" | "Jum" | "Sab";
type DayOrder = Record<DayName, number>;

// GET all doctors from the MySQL database for public access
export async function GET() {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    // Fetch all doctors
    const doctors = await DoctorModel.findAll({
      attributes: ["id", "name", "spesialization", "schedule", "createdAt"],
      order: [["name", "ASC"]],
    });

    // Fetch all specializations to map IDs to names
    const spesializations = await SpesializationModel.findAll({
      attributes: ["id", "name"],
    });

    // Create a map for quick lookup of specialization names
    const spesializationMap = new Map();
    spesializations.forEach((spec) => {
      spesializationMap.set(spec.id, spec.name);
    });

    // Map the database model to a simpler format with calculated fields for the frontend
    const formattedDoctors = doctors.map((doctor) => {
      // Get specialization name from the map or use the ID as fallback
      const specialty =
        spesializationMap.get(doctor.spesialization) ||
        doctor.spesialization ||
        "General Practitioner";

      // Generate a random rating between 4.3 and 5.0
      const rating = (Math.random() * (5.0 - 4.3) + 4.3).toFixed(1);

      // Parse the doctor's schedule or generate random availability if not available
      let availableDays: DayName[] = [];
      if (doctor.schedule) {
        try {
          const scheduleData = JSON.parse(doctor.schedule);
          // Handle both array and object formats for backward compatibility
          if (Array.isArray(scheduleData)) {
            availableDays = scheduleData as DayName[];
          } else if (typeof scheduleData === "object") {
            availableDays = Object.keys(scheduleData) as DayName[];
          } else {
            availableDays = generateRandomAvailabilityDays();
          }
        } catch (error) {
          console.error("Error parsing doctor schedule:", error);
          availableDays = generateRandomAvailabilityDays();
        }
      } else {
        availableDays = generateRandomAvailabilityDays();
      }

      // Sort days in a logical order (Mon-Sat)
      const dayOrder: DayOrder = {
        Sen: 1,
        Sel: 2,
        Rab: 3,
        Kam: 4,
        Jum: 5,
        Sab: 6,
      };

      availableDays.sort((a, b) => dayOrder[a] - dayOrder[b]);

      return {
        id: doctor.id,
        name: `Dr. ${doctor.name}`,
        specialty: specialty,
        spesialization: doctor.spesialization,
        specializationId: doctor.spesialization,
        imageUrl: "", // Placeholder for image
        rating: parseFloat(rating),
        availability: availableDays.join(", "),
        scheduleData: doctor.schedule || null, // Add the raw schedule data for more detailed views
      };
    });

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error("Error fetching public doctors list:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

// Helper function to generate random availability days when no schedule exists
function generateRandomAvailabilityDays(): DayName[] {
  const days: DayName[] = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const availableDays: DayName[] = [];
  const numDays = Math.floor(Math.random() * 4) + 2; // 2 to 5 days

  for (let i = 0; i < numDays; i++) {
    if (days.length === 0) break;

    const randomIndex = Math.floor(Math.random() * days.length);
    const day = days[randomIndex];
    availableDays.push(day);

    // Remove the selected day to avoid duplicates
    days.splice(randomIndex, 1);
  }

  return availableDays;
}
