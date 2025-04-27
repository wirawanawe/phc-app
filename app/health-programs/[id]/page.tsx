"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function HealthProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/health-programs/${programId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch health program");
        }

        const data = await response.json();
        setProgram(data);

        // Check if user is enrolled in this program
        const enrolledPrograms = JSON.parse(
          localStorage.getItem("enrolled_programs") || "[]"
        );

        const enrolledProgram = enrolledPrograms.find(
          (p: any) => p.id === programId
        );
        if (enrolledProgram) {
          setIsEnrolled(true);
          setProgress(enrolledProgram.progress || 0);
          setCompletedTasks(enrolledProgram.completedTasks || 0);
          setTotalTasks(enrolledProgram.totalTasks || 0);
        } else {
          setIsEnrolled(false);
        }

        // Fetch user data
        const userResponse = await fetch("/api/users/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // If enrolled, fetch current tasks to calculate latest progress
        if (enrolledProgram) {
          try {
            const tasksResponse = await fetch(
              `/api/tasks?healthProgramId=${programId}`
            );
            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json();
              if (tasksData && tasksData.length > 0) {
                const completed = tasksData.filter(
                  (task: any) => task.status === "inactive" || task.completedAt
                ).length;
                const progressPercentage = Math.round(
                  (completed / tasksData.length) * 100
                );

                setProgress(progressPercentage);
                setCompletedTasks(completed);
                setTotalTasks(tasksData.length);

                // Update localStorage with the latest progress
                const updatedPrograms = enrolledPrograms.map((p: any) => {
                  if (p.id === programId) {
                    return {
                      ...p,
                      progress: progressPercentage,
                      completedTasks: completed,
                      totalTasks: tasksData.length,
                    };
                  }
                  return p;
                });

                localStorage.setItem(
                  "enrolled_programs",
                  JSON.stringify(updatedPrograms)
                );
              }
            }
          } catch (err) {
            console.error("Error fetching tasks for progress:", err);
          }
        }

        setError(null);
      } catch (err) {
        setError(
          "Failed to load health program details. Please try again later."
        );
        console.error("Error fetching health program:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const handleEnroll = async () => {
    if (!user) return;

    // Check if user has the 'participant' role
    if (user.role !== "participant") {
      // For non-participant roles, redirect to a page to register as participant
      alert(
        "Hanya akun participant yang dapat mengikuti program kesehatan. Silakan daftar sebagai participant terlebih dahulu."
      );
      router.push("/register-participant");
      return;
    }

    try {
      // Enroll in program via API
      const response = await fetch(`/api/health-programs/${programId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to enroll in program");
      }

      // Update UI state after successful enrollment
      setIsEnrolled(true);

      // Also update localStorage to maintain compatibility with existing code
      const enrolledPrograms = JSON.parse(
        localStorage.getItem("enrolled_programs") || "[]"
      );

      // Add this program to enrolled programs if not already enrolled
      if (!enrolledPrograms.some((p: any) => p.id === programId)) {
        const newEnrolledProgram = {
          ...program,
          joinedDate: new Date().toISOString().split("T")[0],
          progress: 0,
          completedTasks: 0,
          totalTasks: 0,
        };

        enrolledPrograms.push(newEnrolledProgram);
        localStorage.setItem(
          "enrolled_programs",
          JSON.stringify(enrolledPrograms)
        );
      }
    } catch (error) {
      console.error("Error enrolling in program:", error);
      alert("Gagal mendaftar program. Silakan coba lagi nanti.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "Program tidak ditemukan"}
              </p>
              <Link
                href="/wellness"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Kembali ke Program Kesehatan
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href="/wellness" className="text-primary hover:underline">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Kembali ke Program Kesehatan
                  </span>
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {program.name}
              </h1>
              <div className="flex items-center mt-2">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    program.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : program.status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                  }`}
                >
                  {program.status === "active"
                    ? "Aktif"
                    : program.status === "completed"
                    ? "Selesai"
                    : "Dibatalkan"}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEnrolled ? (
                <>
                  {user && user.role === "admin" ? (
                    <Link
                      href={`/admin/health-programs/${programId}/tasks`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Kelola Tugas (Admin)
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  {!user ? (
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Login untuk Mengikuti Program
                    </Link>
                  ) : user.role === "participant" ? (
                    <button
                      onClick={handleEnroll}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Daftar Program
                    </button>
                  ) : (
                    <Link
                      href="/register-participant"
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Daftar sebagai Participant
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Mulai
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(program.startDate).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Selesai
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {program.endDate
                      ? new Date(program.endDate).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Berkelanjutan"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Lokasi
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {program.location || "Online"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Kuota Peserta
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {program.maxParticipants
                      ? `${program.maxParticipants} peserta`
                      : "Tidak terbatas"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Deskripsi Program
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300">
                    {program.description}
                  </p>
                </div>
              </div>

              {/* Progress section - only shown if user is enrolled */}
              {isEnrolled && (
                <div className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Progress Program
                  </h2>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Penyelesaian
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                      <span>
                        {completedTasks} dari {totalTasks} tugas selesai
                      </span>
                      {progress === 100 && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Program Selesai!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task status summary */}
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">
                        {totalTasks}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total Tugas
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">
                        {completedTasks}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tugas Selesai
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                        {totalTasks - completedTasks}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tugas Tersisa
                      </div>
                    </div>
                  </div>

                  {/* Link to tasks */}
                  <div className="flex space-x-3 mt-4">
                    <Link
                      href={`/health-programs/${programId}/tasks`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Lihat Detail Tugas
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
