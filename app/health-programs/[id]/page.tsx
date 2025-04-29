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
  const [programStatus, setProgramStatus] = useState<string>("");

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

          // Set program status based on progress
          if (enrolledProgram.progress === 100) {
            setProgramStatus("completed");
          } else {
            setProgramStatus(enrolledProgram.status || "active");
          }
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

                // Update programStatus if all tasks are completed
                if (progressPercentage === 100) {
                  setProgramStatus("completed");
                }

                // Update localStorage with the latest progress
                const updatedPrograms = enrolledPrograms.map((p: any) => {
                  if (p.id === programId) {
                    return {
                      ...p,
                      progress: progressPercentage,
                      completedTasks: completed,
                      totalTasks: tasksData.length,
                      status:
                        progressPercentage === 100 ? "completed" : p.status,
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

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `/api/participants/my-programs/${programId}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          setIsEnrolled(true);
        } else if (response.status === 404) {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error checking enrollment status:", error);
        setIsEnrolled(false);
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [user, programId]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has the 'participant' role
    if (user.role !== "participant") {
      alert(
        "Hanya akun participant yang dapat mengikuti program kesehatan. Silakan daftar sebagai participant terlebih dahulu."
      );
      router.push("/register-participant");
      return;
    }

    // Tampilkan loading state atau indikator
    setLoading(true);

    try {
      console.log("Enrolling user in program:", programId);

      // Enroll in program via API - gunakan pendekatan yang lebih sederhana
      const response = await fetch(`/api/health-programs/${programId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        cache: "no-store",
      });

      // Log full response for debugging
      console.log("Enrollment response status:", response.status);

      // Pastikan response bisa di-parse sebagai JSON
      let responseData: any = {};
      try {
        responseData = await response.json();
        console.log("Enrollment response data:", responseData);
      } catch (e) {
        console.error("Error parsing JSON response:", e);
      }

      if (response.status === 200) {
        // Sukses - update state dan redirect
        console.log("Enrollment successful");
        setIsEnrolled(true);

        // Update localStorage with new enrollment
        const enrolledPrograms = JSON.parse(
          localStorage.getItem("enrolled_programs") || "[]"
        );

        // Add this program to enrolled programs if not already enrolled
        if (!enrolledPrograms.some((p: any) => p.id === programId)) {
          const newEnrolledProgram = {
            id: programId,
            name: program.name,
            joinedDate: new Date().toISOString().split("T")[0],
            status: "active",
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

        // Redirect to my-programs page
        console.log("Redirecting to my-programs");
        router.push("/my-programs");
      } else if (response.status === 404) {
        // Program tidak ditemukan atau user tidak ditemukan
        throw new Error(
          responseData.error || "Program atau profil tidak ditemukan"
        );
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/login");
      } else {
        // Kasus error lainnya
        throw new Error(responseData.error || "Gagal mendaftar program");
      }
    } catch (error) {
      console.error("Error enrolling in program:", error);
      alert(
        `Gagal mendaftar program: ${
          error instanceof Error ? error.message : "Silakan coba lagi nanti"
        }`
      );
    } finally {
      setLoading(false);
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
                programStatus === "completed" ? (
                  <button
                    className="min-w-[120px] px-4 py-2 bg-green-500 text-white rounded-md cursor-not-allowed opacity-80"
                    disabled
                  >
                    Tugas Selesai
                  </button>
                ) : (
                  <Link
                    href={`/my-programs/${programId}`}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Lanjutkan Program
                  </Link>
                )
              ) : (
                <button
                  onClick={handleEnroll}
                  className={`min-w-[120px] min-h-[40px] px-6 py-3 text-white rounded-md transition-colors cursor-pointer font-medium ${
                    loading ? "bg-gray-400" : "bg-primary hover:bg-primary-dark"
                  }`}
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Ikuti Program"}
                </button>
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
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    Progress Program
                    {programStatus === "completed" && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Selesai
                      </span>
                    )}
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
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          progress === 100 ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                      <span>
                        {completedTasks} dari {totalTasks} tugas selesai
                      </span>
                      {progress === 100 && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Semua tugas telah diselesaikan!
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
                      <div
                        className={`text-2xl font-bold ${
                          progress === 100 ? "text-green-500" : "text-primary"
                        }`}
                      >
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
                    {programStatus !== "completed" ? (
                      <Link
                        href={`/health-programs/${programId}/tasks`}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Lihat Detail Tugas
                      </Link>
                    ) : (
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md opacity-80 cursor-not-allowed"
                        disabled
                      >
                        Tugas Selesai
                      </button>
                    )}
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
