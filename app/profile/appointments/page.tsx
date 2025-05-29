"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AppointmentQRCode from "@/app/components/AppointmentQRCode";
import Link from "next/link";
import { formatDate } from "@/app/utils/dateUtils";

interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  doctor: Doctor;
  notes?: string;
  participantId: string;
}

export default function ProfileAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past">(
    "upcoming"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchAppointments();
  }, [user, router]);

  useEffect(() => {
    if (appointments.length === 0) {
      setFilteredAppointments([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (activeFilter) {
      case "upcoming":
        setFilteredAppointments(
          appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return (
              appointmentDate.getTime() >= today.getTime() &&
              appointment.status === "scheduled"
            );
          })
        );
        break;
      case "past":
        setFilteredAppointments(
          appointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return (
              appointmentDate.getTime() < today.getTime() ||
              appointment.status !== "scheduled"
            );
          })
        );
        break;
      case "all":
      default:
        setFilteredAppointments(appointments);
        break;
    }
  }, [appointments, activeFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/appointments/my-appointments");
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load your appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to render appointment status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Terjadwal
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Selesai
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  // Helper to format time
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) return time;
    return `${hours}:${minutes}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-primary p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-0">
                Janji Temu Saya
              </h1>
            </div>
            <p className="text-blue-100 mt-2">Kelola janji temu dokter Anda</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-l-4 border-blue-500 mx-4 sm:mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Janji temu hanya berlaku pada tanggal yang telah ditentukan.
                  Janji temu dengan status "Terjadwal" akan otomatis berubah
                  menjadi "Selesai" setelah tanggal janji temu berlalu.
                </p>
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mx-4 sm:mx-6 mt-6 mb-4">
            <button
              onClick={() => setActiveFilter("upcoming")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "upcoming"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Akan Datang
            </button>
            <button
              onClick={() => setActiveFilter("past")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "past"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Selesai / Dibatalkan
            </button>
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Semua
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Memuat janji temu...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Coba Lagi
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda belum memiliki janji temu
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {activeFilter === "upcoming"
                  ? "Tidak ada janji temu yang akan datang"
                  : activeFilter === "past"
                  ? "Tidak ada janji temu yang telah selesai atau dibatalkan"
                  : "Tidak ada janji temu yang sesuai filter"}
              </p>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Lihat Semua Janji Temu
                </button>
              )}
              <Link
                href="/appointments"
                className="mt-4 block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Buat Janji Temu Baru
              </Link>
            </div>
          ) : (
            <div>
              {/* Mobile view - card layout */}
              <div className="block sm:hidden">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {appointment.doctor?.name || "Dokter"}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {formatDate(new Date(appointment.date))},{" "}
                          {formatTime(appointment.time)}
                        </div>
                      </div>
                      <div>{renderStatusBadge(appointment.status)}</div>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {appointment.notes}
                      </p>
                    )}

                    {appointment.status === "scheduled" && (
                      <div className="flex justify-center mt-3">
                        <AppointmentQRCode
                          appointment={appointment}
                          size={100}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop view - table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Tanggal & Waktu
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Dokter
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Catatan
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        QR Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div>{formatDate(new Date(appointment.date))}</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {appointment.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {appointment.doctor?.name || "Tidak tersedia"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {appointment.notes || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {appointment.status === "scheduled" && (
                            <AppointmentQRCode appointment={appointment} />
                          )}
                          {appointment.status !== "scheduled" && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Link
            href="/appointments"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Buat Janji Temu Baru
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
