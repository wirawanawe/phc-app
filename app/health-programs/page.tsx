"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface HealthProgram {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  maxParticipants: number | null;
  status: string;
  category?: {
    id: string;
    name: string;
    color: string;
    description: string;
  };
}

interface ProgramCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export default function HealthProgramsPage() {
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [allCategories, setAllCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [enrolledPrograms, setEnrolledPrograms] = useState<string[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load user's enrolled programs when component mounts
    if (user) {
      const storedPrograms = JSON.parse(
        localStorage.getItem("enrolled_programs") || "[]"
      );
      // Extract just the IDs of active programs
      const enrolledProgramIds = storedPrograms
        .filter((p: any) => p.status === "active" || !p.status)
        .map((p: any) => p.id);
      setEnrolledPrograms(enrolledProgramIds);
    }
  }, [user]);

  // Function to retry a failed request with backoff
  const fetchWithRetry = async (url: string, retries = 3, backoff = 300) => {
    try {
      const response = await fetch(url);
      return response;
    } catch (err) {
      if (retries <= 1) throw err;

      // Wait for backoff duration
      await new Promise((resolve) => setTimeout(resolve, backoff));

      // Retry with one less retry and exponential backoff
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all program categories with retry
        const categoryResponse = await fetchWithRetry(
          "/api/program-categories"
        );
        if (!categoryResponse.ok) {
          console.warn(
            `Failed to fetch program categories: ${categoryResponse.status} ${categoryResponse.statusText}`
          );
        } else {
          const categoryData = await categoryResponse.json();
          setAllCategories(categoryData);
        }

        // Fetch all health programs with retry
        const programsResponse = await fetchWithRetry("/api/health-programs");
        if (!programsResponse.ok) {
          const errorData = await programsResponse.json().catch(() => ({}));
          const errorMessage =
            errorData.error || `HTTP error ${programsResponse.status}`;
          throw new Error(errorMessage);
        }

        const programsData = await programsResponse.json();
        console.log("Raw data from API:", programsData);

        // Ensure we properly handle any category objects
        const processedData = programsData.map((program: any) => {
          // Make sure category is properly structured
          if (program.category && typeof program.category === "object") {
            return {
              ...program,
              category: {
                id: program.category.id || "",
                name: program.category.name || "Uncategorized",
                color: program.category.color || "#E32345",
                description: program.category.description || "",
              },
            };
          }
          return program;
        });

        setPrograms(processedData);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load health programs. Please try again later.";

        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate program duration in days
  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return "Berkelanjutan";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} hari`;
  };

  // Check if user is enrolled in a program
  const isEnrolled = (programId: string) => {
    return enrolledPrograms.includes(programId);
  };

  // Handle enrolling in a program
  const handleEnroll = async (program: HealthProgram) => {
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
      const response = await fetch(
        `/api/health-programs/${program.id}/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to enroll in program");
      }

      // Update state with new enrolled program
      setEnrolledPrograms((prev) => [...prev, program.id]);

      // Also update localStorage to maintain compatibility with existing code
      const enrolledPrograms = JSON.parse(
        localStorage.getItem("enrolled_programs") || "[]"
      );

      // Add this program to enrolled programs if not already enrolled
      if (!enrolledPrograms.some((p: any) => p.id === program.id)) {
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

      // Navigate to the health program detail page
      router.push(`/health-programs/${program.id}`);
    } catch (error) {
      console.error("Error enrolling in program:", error);
      alert("Gagal mendaftar program. Silakan coba lagi nanti.");
    }
  };

  // Get unique categories from programs
  const programCategories = programs
    .map((p) => p.category?.name)
    .filter((name): name is string => name !== undefined);

  const uniqueCategories = Array.from(new Set(programCategories));

  const categories = ["Semua", ...uniqueCategories];

  // Filter programs by selected category
  const filteredPrograms =
    selectedCategory === "Semua"
      ? programs
      : programs.filter(
          (program) => program.category?.name === selectedCategory
        );

  // For debugging
  console.log("Programs:", JSON.stringify(programs.slice(0, 1)));
  console.log("Categories:", categories);

  // Check if there's an error loading programs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tidak dapat memuat program kesehatan
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md"
              >
                Muat Ulang
              </button>
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

      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Program Kesehatan & Kebugaran
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Tingkatkan kesehatan dan kesejahteraan Anda secara keseluruhan
              dengan program kesehatan komprehensif kami yang dirancang untuk
              kebutuhan unik Anda.
            </p>
          </div>

          <div className="flex items-center justify-center mb-10">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    Beranda
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
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                      Program Kesehatan
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Pilih Kategori Program
            </h2>

            {loading ? (
              <div className="flex space-x-2 justify-center">
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {/* Always include the "Semua" (All) category */}
                <div
                  key="all-category"
                  className={`inline-flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedCategory === "Semua"
                      ? "ring-2 ring-offset-2 font-medium"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === "Semua" ? "#667eea20" : "#667eea10",
                    borderWidth: "1px",
                    borderColor: "#667eea40",
                  }}
                  onClick={() => setSelectedCategory("Semua")}
                >
                  <span className="text-sm" style={{ color: "#667eea" }}>
                    Semua Kategori
                  </span>
                </div>

                {allCategories.length > 0
                  ? allCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`inline-flex items-center px-4 py-2 rounded-full cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedCategory === category.name
                            ? `ring-2 ring-offset-2 font-medium`
                            : ""
                        }`}
                        style={{
                          backgroundColor: `${category.color}15`,
                          borderWidth: "1px",
                          borderColor: `${category.color}40`,
                        }}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <span
                          className="text-sm"
                          style={{ color: category.color }}
                        >
                          {category.name}
                        </span>
                      </div>
                    ))
                  : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Program Kesehatan Tersedia
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {selectedCategory === "Semua"
                ? "Berbagai program kesehatan yang tersedia untuk Anda"
                : `Program kesehatan dalam kategori "${selectedCategory}"`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div
                        className="h-2"
                        style={{
                          backgroundColor: program.category?.color || "#E32345",
                        }}
                      ></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            {program.category && program.category.name && (
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                                style={{
                                  backgroundColor: `${
                                    program.category.color || "#E32345"
                                  }20`,
                                  color: program.category.color || "#E32345",
                                  borderWidth: "1px",
                                  borderColor: `${
                                    program.category.color || "#E32345"
                                  }40`,
                                }}
                              >
                                {program.category.name}
                              </span>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Durasi:{" "}
                              {calculateDuration(
                                program.startDate,
                                program.endDate
                              )}
                            </p>
                          </div>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
                            {program.maxParticipants
                              ? `Max ${program.maxParticipants} peserta`
                              : "Tidak dibatasi"}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {program.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {program.description}
                        </p>

                        <div className="flex justify-between items-center mt-6">
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

                          {user ? (
                            isEnrolled(program.id) ? (
                              <Link
                                href={`/health-programs/${program.id}`}
                                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                              >
                                Lanjutkan Program
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleEnroll(program)}
                                className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                              >
                                Ikuti Program
                              </button>
                            )
                          ) : (
                            <Link
                              href="/login"
                              className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                            >
                              Daftar Sekarang
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Tidak ada program kesehatan yang tersedia saat ini.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Perjalanan Kesehatan Anda?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {user
              ? "Mulai program kesehatan Anda hari ini dan rasakan perbedaannya dalam kehidupan sehari-hari."
              : "Bergabunglah dengan program kesehatan kami hari ini dan ambil langkah pertama menuju kehidupan yang lebih sehat dan seimbang."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {user ? (
              <>
                <Link
                  href="/my-programs"
                  className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium rounded-md"
                >
                  Program Saya
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium rounded-md"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
