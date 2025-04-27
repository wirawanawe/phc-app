"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TaskManager from "@/app/components/TaskManager";

export default function AdminHealthProgramTasksPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/admin/health-programs/${programId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch health program");
        }

        const data = await response.json();
        setProgram(data);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">
              {error || "Program tidak ditemukan"}
            </p>
            <Link
              href="/admin/health-programs"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Kembali ke Daftar Program
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/health-programs"
              className="text-blue-500 hover:underline"
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
                Kembali ke Daftar Program
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Tugas Program
          </h1>
          <p className="text-gray-600">
            Kelola tugas-tugas untuk program:{" "}
            <span className="font-medium">{program.name}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Informasi Program
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nama Program</p>
            <p className="text-gray-900 font-medium">{program.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                program.status === "active"
                  ? "bg-green-100 text-green-800"
                  : program.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {program.status === "active"
                ? "Aktif"
                : program.status === "completed"
                ? "Selesai"
                : "Dibatalkan"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Kategori</p>
            <p className="text-gray-900 font-medium">
              {program.category ? program.category.name : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Periode</p>
            <p className="text-gray-900 font-medium">
              {new Date(program.startDate).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {program.endDate
                ? ` - ${new Date(program.endDate).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : " (Berkelanjutan)"}
            </p>
          </div>
        </div>
      </div>

      {/* Task Manager Component */}
      <TaskManager
        healthProgramId={programId}
        healthProgramName={program.name}
      />
    </div>
  );
}
