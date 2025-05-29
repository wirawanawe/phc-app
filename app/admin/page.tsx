"use client";

import { useEffect, useState } from "react";
// Remove the direct import from db.ts
// import { initDb } from "./db";

interface DashboardStats {
  users: number;
  doctors: number;
  participants: number;
  appointments: number;
  programs: number;
}

export default function AdminDashboard() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    doctors: 0,
    participants: 0,
    appointments: 0,
    programs: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check database status and fetch stats
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check database status
        const statusResponse = await fetch("/api/admin/db-status");
        const statusData = await statusResponse.json();
        setIsConnected(statusData.connected && statusData.initialized);

        if (statusData.connected && statusData.initialized) {
          // Fetch dashboard stats
          const response = await fetch("/api/admin/stats");
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to fetch dashboard statistics");
          }
        } else {
          // Set appropriate error message based on the status
          if (!statusData.connected) {
            setError(
              "Database connection failed. Please check your database configuration."
            );
          } else if (!statusData.initialized) {
            setError(
              statusData.initializationError || "Failed to initialize database."
            );
          }
        }
      } catch (err) {
        console.error("Database error:", err);
        setError("Failed to connect to database");
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-black bg-white">
        Admin Dashboard
      </h1>

      {/* Database connection status */}
      <div
        className={`p-4 mb-6 rounded-lg ${
          isConnected ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <p className="flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="font-medium text-black">Database Status:</span>
          <span className="ml-2 text-black">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">Users</h2>
            <p className="text-4xl font-bold text-blue-500 mb-4">
              {stats.users}
            </p>
            <a
              href="/admin/users"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Users
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">Doctors</h2>
            <p className="text-4xl font-bold text-blue-500 mb-4">
              {stats.doctors}
            </p>
            <a
              href="/admin/doctors"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Doctors
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">
              Participants
            </h2>
            <p className="text-4xl font-bold text-blue-500 mb-4">
              {stats.participants}
            </p>
            <a
              href="/admin/participants"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Participants
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">
              Appointments
            </h2>
            <p className="text-4xl font-bold text-blue-500 mb-4">
              {stats.appointments}
            </p>
            <a
              href="/admin/appointments"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Appointments
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-black mb-2">
              Health Programs
            </h2>
            <p className="text-4xl font-bold text-blue-500 mb-4">
              {stats.programs}
            </p>
            <a
              href="/admin/health-programs"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Programs
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
