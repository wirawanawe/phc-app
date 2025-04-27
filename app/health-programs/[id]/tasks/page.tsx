"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ProgramTasksPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);

  // Calculate progress when tasks change
  useEffect(() => {
    if (tasks.length === 0) return;

    const completedTasks = tasks.filter(
      (task) => task.status === "inactive" || task.completedAt
    ).length;

    const progressPercentage = Math.round(
      (completedTasks / tasks.length) * 100
    );
    setProgress(progressPercentage);

    // Update progress in localStorage for this program
    const enrolledPrograms = JSON.parse(
      localStorage.getItem("enrolled_programs") || "[]"
    );

    const updatedPrograms = enrolledPrograms.map((p: any) => {
      if (p.id === programId) {
        return {
          ...p,
          progress: progressPercentage,
          completedTasks,
          totalTasks: tasks.length,
        };
      }
      return p;
    });

    localStorage.setItem("enrolled_programs", JSON.stringify(updatedPrograms));
  }, [tasks, programId]);

  useEffect(() => {
    const fetchProgramAndTasks = async () => {
      try {
        // Fetch program details
        const programResponse = await fetch(
          `/api/health-programs/${programId}`
        );
        if (!programResponse.ok) {
          throw new Error("Failed to fetch health program");
        }
        const programData = await programResponse.json();
        setProgram(programData);

        // Fetch tasks for this program
        const tasksResponse = await fetch(
          `/api/tasks?healthProgramId=${programId}`
        );

        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch program tasks");
        }

        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        // Fetch user data
        const userResponse = await fetch("/api/users/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load program tasks. Please try again later.");
        console.error("Error fetching program tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgramAndTasks();
    }
  }, [programId]);

  const markTaskAsCompleted = async (taskId: string) => {
    try {
      const response = await fetch(
        `/api/health-programs/${programId}/tasks/${taskId}/complete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark task as completed");
      }

      const result = await response.json();

      // Update the task status locally with response data
      setTasks(tasks.map((task) => (task.id === taskId ? result.data : task)));
    } catch (err) {
      console.error("Error marking task as completed:", err);
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
                <Link
                  href={`/health-programs/${programId}`}
                  className="text-primary hover:underline"
                >
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
                    Kembali ke Detail Program
                  </span>
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tugas Program: {program.name}
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
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Progress Tugas
                </h2>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {
                  tasks.filter(
                    (task) => task.status === "inactive" || task.completedAt
                  ).length
                }{" "}
                dari {tasks.length} tugas selesai
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daftar Tugas
              </h2>

              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ada tugas untuk program ini saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>

                          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            {task.timePerformed && (
                              <span className="inline-block mr-4">
                                <span className="font-medium">Waktu:</span>{" "}
                                {task.timePerformed}
                              </span>
                            )}

                            {task.completedAt && (
                              <span className="inline-block">
                                <span className="font-medium">
                                  Selesai pada:
                                </span>{" "}
                                {new Date(task.completedAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            )}

                            <span className="inline-block ml-4">
                              <span className="font-medium">Prioritas:</span>{" "}
                              {task.priority === "high"
                                ? "Tinggi"
                                : task.priority === "medium"
                                ? "Sedang"
                                : "Rendah"}
                            </span>
                          </div>
                        </div>

                        <div>
                          {task.status === "inactive" || task.completedAt ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Selesai
                            </span>
                          ) : (
                            <button
                              onClick={() => markTaskAsCompleted(task.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors text-sm"
                            >
                              Tandai Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
