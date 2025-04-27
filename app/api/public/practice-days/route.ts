import { NextResponse } from "next/server";

// Definisi hari-hari praktik
const practiceDays = [
  { value: "", label: "Semua Hari" },
  { value: "Sen", label: "Senin" },
  { value: "Sel", label: "Selasa" },
  { value: "Rab", label: "Rabu" },
  { value: "Kam", label: "Kamis" },
  { value: "Jum", label: "Jumat" },
  { value: "Sab", label: "Sabtu" },
];

// GET semua hari praktik
export async function GET() {
  try {
    return NextResponse.json(practiceDays);
  } catch (error) {
    console.error("Error fetching practice days:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice days" },
      { status: 500 }
    );
  }
}
