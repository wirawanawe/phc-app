"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import ConfirmDialog from "@/app/components/ConfirmDialog";
// @ts-ignore
import { AnimatePresence, motion } from "framer-motion";

// Fallback icons when lucide-react has compatibility issues
const CheckCircle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const Circle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const PlayCircle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const RefreshCw = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const ChevronDown = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Loader = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  timePerformed?: string;
  dueDate?: string;
  completed: boolean;
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
  programUrl: string;
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

    // Add additional checks for required user data
    if (!user.id) {
      console.error("User missing ID property:", user);
      setError(
        "Data pengguna tidak lengkap. Silakan keluar dan masuk kembali."
      );
      return;
    }

    // Check if user has participant role
    if (user.role !== "participant") {
      console.log("User role is not participant:", user.role);
      setError("Hanya akun participant yang dapat mengakses halaman program.");
      return;
    }

    console.log("User authenticated, fetching programs with user ID:", user.id);
    setLoading(true); // Set loading to true before fetching
    fetchEnrolledPrograms();
  }, [user, router]);

  // Tambahkan useEffect untuk refresh data saat halaman aktif
  useEffect(() => {
    // Refresh programs when the page becomes visible (user switches tabs or navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.id) {
        console.log("Page is now visible, refreshing programs");
        fetchEnrolledPrograms();
      }
    };

    // Add event listener for page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  // Tambahkan fungsi untuk reload data
  const refreshData = () => {
    if (user?.id) {
      setLoading(true);
      fetchEnrolledPrograms();
    }
  };

  const fetchEnrolledPrograms = async () => {
    if (!user || !user.id) {
      console.error("Cannot fetch programs without user ID");
      setError("Sesi tidak valid. Silakan masuk kembali.");
      setLoading(false);
      return;
    }

    console.log("Starting to fetch enrolled programs for user ID:", user.id);
    try {
      // Langsung ambil data program tanpa melakukan check-profile terlebih dahulu
      // karena check-profile API mengembalikan 401 yang sama jika token tidak valid

      // Tambahkan parameter timestamp untuk menghindari cache
      const timestamp = new Date().getTime();

      const response = await fetch(
        `/api/participants/my-programs?t=${timestamp}`,
        {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      console.log("API Response status:", response.status);

      if (response.status === 401) {
        console.log("Authentication failed (401) - Token mungkin kedaluwarsa");
        setError("Sesi Anda telah berakhir. Silakan masuk kembali.");

        // Lakukan logout otomatis
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });

          // Hapus data user dari localStorage
          localStorage.removeItem("phc_user");
          localStorage.removeItem("user");

          // Arahkan ke halaman login
          router.push("/login");
        } catch (logoutError) {
          console.error("Error during automatic logout:", logoutError);
          // Tetap arahkan ke login meskipun logout gagal
          router.push("/login");
        }
        return;
      }

      if (response.status === 404) {
        console.log("Participant profile not found for this user (404)");
        setError(
          "Profil participant tidak ditemukan. Silakan daftar sebagai participant terlebih dahulu."
        );
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Gagal mengambil data program");
      }

      const data = await response.json();
      console.log("Programs fetched successfully:", data.length);
      console.log("Programs data:", data);

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

  const startProgram = (programId: string) => {
    router.push(`/my-programs/${programId}`);
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
      <div className="container mx-auto py-8 px-4 min-h-screen bg-white">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Program Saya
            </h1>
            <p className="text-gray-600">
              Kelola program kesehatan yang sedang Anda ikuti
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
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
                  Memuat...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Muat Ulang
                </span>
              )}
            </button>
            <Link
              href="/health-programs"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Cari Program Baru
            </Link>
          </div>
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
              <motion.div
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

                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      {program.status !== "completed" ? (
                        <>
                          <Link
                            href={`/my-programs/${program.id}`}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm text-center"
                          >
                            Lanjutkan Program
                          </Link>
                          <button
                            onClick={() =>
                              handleCompleteProgram(program.enrollmentId)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Selesaikan Program
                          </button>
                        </>
                      ) : (
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-md cursor-not-allowed opacity-80 text-sm"
                          disabled
                        >
                          Tugas Selesai
                        </button>
                      )}
                    </div>
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

                {expandedProgram === program.id && program.tasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 bg-gray-50">
                      <h3 className="font-medium text-gray-800 mb-3">Tasks:</h3>
                      <div className="space-y-3">
                        {program.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start p-3 bg-white rounded-md border border-gray-100"
                          >
                            <div className="mr-3 mt-0.5">
                              {task.completed ? <CheckCircle /> : <Circle />}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  task.completed
                                    ? "text-gray-500"
                                    : "text-gray-700"
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.dueDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Due: {task.dueDate}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() =>
                            window.open(program.programUrl, "_blank")
                          }
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          Program Details
                        </button>
                        <button
                          onClick={() => startProgram(program.id)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm flex items-center gap-1"
                        >
                          <PlayCircle />
                          <span>Continue</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {expandedProgram === program.id &&
                  program.tasks.length === 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-500 text-sm">
                        Belum ada tugas untuk program ini.
                      </p>
                    </div>
                  )}
              </motion.div>
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
