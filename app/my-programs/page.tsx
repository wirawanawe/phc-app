"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import ConfirmDialog from "@/app/components/ConfirmDialog";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  timePerformed?: string;
}

interface EnrolledProgram {
  id: string;
  enrollmentId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: string;
  progress: number;
  category?: {
    name: string;
    color: string;
  };
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
}

export default function MyProgramsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [enrolledPrograms, setEnrolledPrograms] = useState<EnrolledProgram[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [programToComplete, setProgramToComplete] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Check authentication first
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    console.log("User authenticated, fetching programs");
    setLoading(true); // Set loading to true before fetching
    fetchEnrolledPrograms();
  }, [user, router]); // Remove loading from the dependency array

  const fetchEnrolledPrograms = async () => {
    console.log("Starting to fetch enrolled programs");
    try {
      const response = await fetch("/api/participants/my-programs", {
        credentials: "include",
      });

      console.log("API Response status:", response.status);

      if (response.status === 401) {
        console.log("Authentication failed (401)");
        setError("Sesi Anda telah berakhir. Silakan masuk kembali.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Gagal mengambil data program");
      }

      const data = await response.json();
      console.log("Programs fetched successfully:", data.length);
      setEnrolledPrograms(data);
    } catch (err) {
      console.error("Error fetching enrolled programs:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat program Anda. Silakan coba lagi nanti."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProgram = (enrollmentId: string) => {
    setProgramToComplete(enrollmentId);
    setIsConfirmDialogOpen(true);
  };

  const confirmCompleteProgram = async () => {
    if (!programToComplete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/participants/enrollments/${programToComplete}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to complete program");
      }

      fetchEnrolledPrograms();
      setIsConfirmDialogOpen(false);
      setProgramToComplete(null);
    } catch (err) {
      console.error("Error completing program:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete program. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleProgramExpand = (programId: string) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(programId);
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return priority;
    }
  };

  const getCategoryBadgeStyle = (color: string) => {
    return {
      backgroundColor: color ? `${color}20` : "#f3f4f6", // Lighter version of color
      color: color || "#374151",
      borderColor: color || "#d1d5db",
    };
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "completed":
        return "Selesai";
      case "inactive":
        return "Nonaktif";
      default:
        return status;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Program Saya
            </h1>
            <p className="text-gray-600">
              Kelola program kesehatan yang sedang Anda ikuti
            </p>
          </div>
          <Link
            href="/health-programs"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Cari Program Baru
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading && enrolledPrograms.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Memuat program...</div>
          </div>
        ) : enrolledPrograms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Belum Ada Program yang Diikuti
            </h2>
            <p className="text-gray-600 mb-6">
              Anda belum mengikuti program kesehatan apapun. Mulai dengan
              menjelajahi program yang tersedia.
            </p>
            <Link
              href="/health-programs"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Jelajahi Program Kesehatan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {enrolledPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {program.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {program.category && (
                          <span
                            className="px-2 py-1 text-xs rounded-full border"
                            style={getCategoryBadgeStyle(
                              program.category.color
                            )}
                          >
                            {program.category.name}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                            program.status
                          )}`}
                        >
                          {formatStatus(program.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {program.description}
                      </p>
                    </div>

                    {program.status !== "completed" && (
                      <button
                        onClick={() =>
                          handleCompleteProgram(program.enrollmentId)
                        }
                        className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Selesaikan Program
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 text-sm">
                        Progress: {program.completedTasks}/{program.totalTasks}{" "}
                        tugas selesai
                      </span>
                      <span className="text-gray-700 text-sm">
                        {program.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${program.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleProgramExpand(program.id)}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {expandedProgram === program.id
                        ? "Tutup Detail"
                        : "Lihat Detail"}
                    </button>
                    <div className="text-sm text-gray-600">
                      <span>
                        Mulai:{" "}
                        {new Date(program.startDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                      {program.endDate && (
                        <span className="ml-3">
                          Selesai:{" "}
                          {new Date(program.endDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task details when expanded */}
                {expandedProgram === program.id && program.tasks.length > 0 && (
                  <div className="border-t border-gray-200">
                    <div className="p-4 bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Daftar Tugas
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Tugas
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Prioritas
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Jam
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {program.tasks.map((task) => (
                              <tr key={task.id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {task.title}
                                  </div>
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {task.description}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                                      task.priority
                                    )}`}
                                  >
                                    {formatPriority(task.priority)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {task.timePerformed || "-"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      task.status === "active"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {task.status === "active"
                                      ? "Belum Selesai"
                                      : "Selesai"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <Link
                        href={`/my-programs/${program.id}`}
                        className="text-primary hover:text-primary-dark text-sm font-medium"
                      >
                        Lihat Detail Lengkap
                      </Link>
                    </div>
                  </div>
                )}

                {expandedProgram === program.id &&
                  program.tasks.length === 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-500 text-sm">
                        Belum ada tugas untuk program ini.
                      </p>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Selesaikan Program"
        message="Apakah Anda yakin ingin menyelesaikan program ini? Anda masih dapat melihat detailnya nanti, tetapi program akan ditandai sebagai selesai."
        onConfirm={confirmCompleteProgram}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setProgramToComplete(null);
        }}
      />

      <Footer />
    </>
  );
}
