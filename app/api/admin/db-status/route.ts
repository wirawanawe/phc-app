import { NextResponse } from "next/server";
import { testConnection } from "@/app/config/db.config";
import { initializeDatabase } from "@/app/models";

// GET database connection status
export async function GET() {
  try {
    // First test direct connection
    const isDirectlyConnected = await testConnection();

    // Then try to initialize the database (creates tables if needed)
    let isInitialized = false;
    let initError = null;

    try {
      isInitialized = await initializeDatabase();
    } catch (err) {
      initError = err instanceof Error ? err.message : "Unknown error";
    }

    return NextResponse.json({
      connected: isDirectlyConnected,
      initialized: isInitialized,
      message: isDirectlyConnected
        ? "Database connection successful"
        : "Failed to connect to database",
      initializationError: initError,
    });
  } catch (error) {
    console.error("Error checking database connection:", error);
    return NextResponse.json({
      connected: false,
      initialized: false,
      message: "Error checking database connection",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
