"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

interface ProgramDetail {
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

export default function ProgramDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState<string | null>(null);
  const [taskAction, setTaskAction] = useState<
    "complete" | "reactivate" | null
  >(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    console.log("User authenticated, fetching program details for ID:", id);
    fetchProgramDetail();
  }, [user, router, id]);

  const fetchProgramDetail = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/participants/my-programs/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch program details");
      }

      const data = await response.json();
      setProgram(data);
      setNotFound(false);
    } catch (err) {
      console.error("Error fetching program details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch program details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProgram = () => {
    if (!program) return;
    setIsConfirmDialogOpen(true);
  };

  const confirmCompleteProgram = async () => {
    if (!program) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/participants/enrollments/${program.enrollmentId}/complete`,
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

      fetchProgramDetail();
      setIsConfirmDialogOpen(false);
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

  const handleTaskStatusChange = (
    taskId: string,
    action: "complete" | "reactivate"
  ) => {
    setTaskToUpdate(taskId);
    setTaskAction(action);
    setIsConfirmDialogOpen(true);
  };

  const confirmTaskStatusChange = async () => {
    if (!taskToUpdate || !taskAction) return;

    setLoading(true);
    try {
      const status = taskAction === "complete" ? "completed" : "active";
      const response = await fetch(
        `/api/participants/tasks/${taskToUpdate}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${taskAction} task`);
      }

      fetchProgramDetail();
    } catch (err) {
      console.error(`Error ${taskAction}ing task:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${taskAction} task. Please try again.`
      );
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
      setTaskToUpdate(null);
      setTaskAction(null);
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

  const getDialogContent = () => {
    if (taskToUpdate && taskAction) {
      const actionText =
        taskAction === "complete" ? "menyelesaikan" : "mengaktifkan kembali";
      return {
        title:
          taskAction === "complete"
            ? "Selesaikan Tugas"
            : "Aktifkan Kembali Tugas",
        message: `Apakah Anda yakin ingin ${actionText} tugas ini?`,
        onConfirm: confirmTaskStatusChange,
      };
    } else {
      return {
        title: "Selesaikan Program",
        message:
          "Apakah Anda yakin ingin menyelesaikan program ini? Program akan ditandai sebagai selesai.",
        onConfirm: confirmCompleteProgram,
      };
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !program) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
          <div className="bg-red-100 text-black p-4 rounded-md mb-4">
            {error}
          </div>
          <Link
            href="/my-programs"
            className="text-primary hover:text-primary-dark"
          >
            &larr; Kembali ke Program Saya
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!program) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
          <div className="bg-yellow-100 text-black p-4 rounded-md mb-4">
            Program tidak ditemukan
          </div>
          <Link
            href="/my-programs"
            className="text-primary hover:text-primary-dark"
          >
            &larr; Kembali ke Program Saya
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const dialogContent = getDialogContent();

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
        <div className="mb-6">
          <Link
            href="/my-programs"
            className="text-primary hover:text-primary-dark"
          >
            &larr; Kembali ke Program Saya
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-black rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-black mb-2">
                  {program.name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {program.category && (
                    <span
                      className="px-3 py-1 text-sm rounded-full border"
                      style={getCategoryBadgeStyle(program.category.color)}
                    >
                      {program.category.name}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeColor(
                      program.status
                    )}`}
                  >
                    {formatStatus(program.status)}
                  </span>
                </div>
                <p className="text-black mb-3">{program.description}</p>
                <div className="text-sm text-black">
                  <div>
                    Tanggal Mulai:{" "}
                    {new Date(program.startDate).toLocaleDateString("id-ID")}
                  </div>
                  {program.endDate && (
                    <div>
                      Tanggal Selesai:{" "}
                      {new Date(program.endDate).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 md:mt-0">
                {program.status !== "completed" && (
                  <button
                    onClick={handleCompleteProgram}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Selesaikan Program
                  </button>
                )}
              </div>
            </div>

            {/* Progress section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-black mb-3">
                Progress Program
              </h2>
              <div className="flex justify-between mb-1">
                <span className="text-black">
                  {program.completedTasks} dari {program.totalTasks} tugas
                  selesai
                </span>
                <span className="text-black">{program.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${program.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Tasks section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-black mb-3">
                Daftar Tugas
              </h2>

              {program.tasks.length === 0 ? (
                <p className="text-black">Belum ada tugas untuk program ini.</p>
              ) : (
                <div className="space-y-4">
                  {program.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-black mb-1">
                              {task.title}
                            </h3>
                            <p className="text-sm text-black mb-2">
                              {task.description}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                              task.priority
                            )}`}
                          >
                            {formatPriority(task.priority)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <div className="flex items-center text-black">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {task.timePerformed || "-"}
                          </div>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status === "completed"
                              ? "Selesai"
                              : "Belum Selesai"}
                          </span>
                        </div>

                        {program.status !== "completed" && (
                          <div className="mt-4">
                            {task.status === "completed" ? (
                              <button
                                onClick={() =>
                                  handleTaskStatusChange(task.id, "reactivate")
                                }
                                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                Aktifkan Kembali
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleTaskStatusChange(task.id, "complete")
                                }
                                className="w-full px-3 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                Tandai Selesai
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={dialogContent.title}
        message={dialogContent.message}
        onConfirm={dialogContent.onConfirm}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setTaskToUpdate(null);
          setTaskAction(null);
        }}
      />

      <Footer />
    </>
  );
}
