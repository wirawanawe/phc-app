"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AppointmentForm from "../components/AppointmentForm";
import Link from "next/link";
import { getDictionary } from "../lib/dictionary";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/dateUtils";
import AppointmentQRCode from "../components/AppointmentQRCode";

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

interface Dictionary {
  appointments: {
    title: string;
    description: string;
  };
  common: {
    menu: {
      home: string;
    };
  };
}

// Metadata should be in a separate layout file when using 'use client'
// export const metadata = {
//   title: "Buat Janji Temu - PHC Healthcare",
//   description: "Buat janji temu dengan spesialis kesehatan kami",
// };

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [activeTab, setActiveTab] = useState<"new" | "my">("new");
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary("id");
      setDictionary(dict as Dictionary);
    };

    loadDictionary();
  }, []);

  // Fetch user's appointments if logged in and tab is "my"
  useEffect(() => {
    if (user && activeTab === "my") {
      fetchMyAppointments();
    }
  }, [user, activeTab]);

  const fetchMyAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/appointments/my-appointments");
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setMyAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load your appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fallback text
  const text = {
    title: dictionary?.appointments?.title || "Buat Janji Temu Anda",
    description:
      dictionary?.appointments?.description ||
      "Jadwalkan konsultasi dengan spesialis kesehatan kami dengan cepat dan mudah.",
    home: dictionary?.common?.menu?.home || "Beranda",
    bookAppointment: "Buat Janji Temu",
    myAppointments: "Janji Temu Saya",
    noAppointments: "Anda belum memiliki janji temu",
    loading: "Memuat janji temu...",
  };

  // Function to render appointment status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Terjadwal
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Selesai
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
              {text.title}
            </h1>
            <p className="text-lg text-black max-w-3xl mx-auto">
              {text.description}
            </p>
          </div>

          <div className="flex items-center justify-center mb-10">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-black hover:text-primary"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    {text.home}
                  </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-black md:ml-2">
                      {text.bookAppointment}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          {user && (
            <div className="mb-8">
              <div className="flex border-b border-gray-500">
                <button
                  onClick={() => setActiveTab("new")}
                  className={`py-3 px-4 font-medium text-sm rounded-t-lg ${
                    activeTab === "new"
                      ? "border-b-2 border-primary text-primary"
                      : "text-black hover:text-primary"
                  }`}
                >
                  {text.bookAppointment}
                </button>
                <button
                  onClick={() => setActiveTab("my")}
                  className={`py-3 px-4 font-medium text-sm rounded-t-lg ${
                    activeTab === "my"
                      ? "border-b-2 border-primary text-primary"
                      : "text-black hover:text-primary"
                  }`}
                >
                  {text.myAppointments}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === "new" ? (
            <div className="lg:col-span-2">
              <AppointmentForm />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
                    {text.loading}
                  </p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                  <button
                    onClick={fetchMyAppointments}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : myAppointments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {text.noAppointments}
                  </p>
                  <button
                    onClick={() => setActiveTab("new")}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Buat Janji Temu
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider"
                        >
                          Tanggal & Waktu
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider"
                        >
                          Dokter
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider"
                        >
                          Catatan
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider"
                        >
                          QR Code
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {myAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div>{formatDate(new Date(appointment.date))}</div>
                            <div className="text-black dark:text-gray-400">
                              {appointment.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {appointment.doctor?.name || "Tidak tersedia"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(appointment.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-black dark:text-gray-400">
                            {appointment.notes || "-"}
                          </td>
                          <td className="px-6 py-4">
                            {appointment.status === "scheduled" && (
                              <AppointmentQRCode appointment={appointment} />
                            )}
                            {appointment.status !== "scheduled" && (
                              <span className="text-sm text-black dark:text-gray-400">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
