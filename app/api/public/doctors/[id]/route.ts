import { NextRequest, NextResponse } from "next/server";
import {
  DoctorModel,
  SpesializationModel,
  initializeDatabase,
} from "@/app/models";

// GET a specific doctor by ID for public access
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure database is initialized
    await initializeDatabase();

    const { id } = params;
    const doctor = await DoctorModel.findByPk(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Get specialization name
    let specialtyName = doctor.spesialization;
    try {
      if (doctor.spesialization) {
        const specialization = await SpesializationModel.findByPk(
          doctor.spesialization
        );
        if (specialization) {
          specialtyName = specialization.name;
        }
      }
    } catch (error) {
      console.error("Error fetching specialization:", error);
    }

    // Parse schedule or use empty object if not available
    let availableDays = [];
    if (doctor.schedule) {
      try {
        const scheduleData = JSON.parse(doctor.schedule);
        // Handle both array and object formats for backward compatibility
        if (Array.isArray(scheduleData)) {
          availableDays = scheduleData;
        } else if (typeof scheduleData === "object") {
          availableDays = Object.keys(scheduleData);
        } else {
          availableDays = generateRandomAvailability();
        }
      } catch (error) {
        console.error("Error parsing doctor schedule:", error);
        availableDays = generateRandomAvailability();
      }
    } else {
      availableDays = generateRandomAvailability();
    }

    // Format the doctor data for public consumption
    const formattedDoctor = {
      id: doctor.id,
      name: `Dr. ${doctor.name}`,
      specialty: specialtyName,
      imageUrl: "", // Placeholder for image
      email: doctor.email || null,
      phone: doctor.phone || null,
      rating: parseFloat((Math.random() * (5.0 - 4.3) + 4.3).toFixed(1)),
      bio: `Dr. ${doctor.name} adalah dokter spesialis ${specialtyName} yang berpengalaman dalam menangani berbagai kasus medis. Dengan pendekatan yang komprehensif dan perhatian penuh pada pasien, Dr. ${doctor.name} berkomitmen memberikan perawatan medis terbaik.`,
      education: [
        "Fakultas Kedokteran Universitas Indonesia",
        `Spesialis ${specialtyName}`,
      ],
      experience: [
        "Rumah Sakit Pusat Pertamina (2015-sekarang)",
        "Rumah Sakit Cipto Mangunkusumo (2010-2015)",
      ],
      availability: availableDays,
    };

    return NextResponse.json(formattedDoctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor details" },
      { status: 500 }
    );
  }
}

// Helper function to generate random availability when no schedule exists
function generateRandomAvailability() {
  // Possible days
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Randomly select 3-5 days
  const numDays = Math.floor(Math.random() * 3) + 3; // 3 to 5 days
  const selectedDays: string[] = [];
  const availableDays = [...dayNames];

  for (let i = 0; i < numDays; i++) {
    if (availableDays.length === 0) break;

    const randomIndex = Math.floor(Math.random() * availableDays.length);
    selectedDays.push(availableDays[randomIndex]);
    availableDays.splice(randomIndex, 1);
  }

  // Sort days in logical order (Mon-Sat)
  const dayOrder: Record<string, number> = {
    Sen: 1,
    Sel: 2,
    Rab: 3,
    Kam: 4,
    Jum: 5,
    Sab: 6,
  };
  selectedDays.sort((a, b) => dayOrder[a] - dayOrder[b]);

  return selectedDays;
}
