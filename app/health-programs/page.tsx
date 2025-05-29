"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [programEnrollmentCounts, setProgramEnrollmentCounts] = useState<
    Record<string, number>
  >({});
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Function to refresh authentication token
  const refreshAuthToken = async (): Promise<boolean> => {
    console.log("Attempting to refresh authentication token...");
    try {
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Token refresh response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Token refresh successful:", data.success);

        if (data.success && data.user && updateUser) {
          updateUser(data.user);
          console.log("User state updated after token refresh");
          return true;
        }
      }

      // If we get here, token refresh failed
      console.warn("Token refresh failed");
      return false;
    } catch (error) {
      console.error("Exception during authentication token refresh:", error);
      return false;
    }
  };

  // Load user's enrolled programs from both localStorage (for UI consistency) and server (for accuracy)
  const loadEnrolledPrograms = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch from server to get accurate data
      const response = await fetch("/api/participants/my-programs", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Extract IDs of active programs from server data
        const serverEnrolledProgramIds = data
          .filter((p: any) => p.status === "active")
          .map((p: any) => p.id);

        // Update localStorage with server data
        const enrolledPrograms = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          joinedDate: new Date(p.enrollmentDate).toISOString().split("T")[0],
          status: p.status,
          progress: p.progress,
          completedTasks: p.completedTasks,
          totalTasks: p.totalTasks,
        }));

        localStorage.setItem(
          "enrolled_programs",
          JSON.stringify(enrolledPrograms)
        );
        setEnrolledPrograms(serverEnrolledProgramIds);
      }
    } catch (err) {
      console.error("Error fetching enrolled programs from server:", err);
    }
  }, [user]);

  // Fetch enrollment counts for each program
  const fetchProgramEnrollmentCounts = useCallback(async () => {
    try {
      const response = await fetch("/api/health-programs/enrollment-counts");
      if (response.ok) {
        const data = await response.json();
        const countsMap: Record<string, number> = {};

        data.forEach((item: { programId: string; count: number }) => {
          countsMap[item.programId] = item.count;
        });

        setProgramEnrollmentCounts(countsMap);
      }
    } catch (err) {
      console.error("Error fetching program enrollment counts:", err);
    }
  }, []);

  useEffect(() => {
    loadEnrolledPrograms();
  }, [loadEnrolledPrograms]);

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

        // Also fetch enrollment counts for all programs
        await fetchProgramEnrollmentCounts();
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
  }, [fetchProgramEnrollmentCounts]);

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

  // Check if program has reached its maximum participants
  const isProgramFull = (program: HealthProgram) => {
    if (!program.maxParticipants) return false; // Unlimited participants

    const enrollmentCount = programEnrollmentCounts[program.id] || 0;
    return enrollmentCount >= program.maxParticipants;
  };

  // Handle enrolling in a program
  const handleEnroll = async (program: HealthProgram) => {
    // Check if program is full
    if (isProgramFull(program)) {
      alert(
        "Program ini telah mencapai batas jumlah peserta. Silakan pilih program lain."
      );
      return;
    }

    // If user is not logged in, redirect to participant registration
    if (!user) {
      console.log(
        "User not authenticated, redirecting to participant registration"
      );
      router.push("/register-participant");
      return;
    }

    // Check if user has the 'participant' role
    if (user.role !== "participant") {
      console.log(
        "User is not a participant, redirecting to participant registration"
      );
      router.push("/register-participant");
      return;
    }

    try {
      const success = await attemptEnrollment(program);
      if (!success) {
        console.error("Enrollment failed after all retries");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mendaftar program. Silakan coba lagi nanti.";
      alert(errorMessage);
    }
  };

  const attemptEnrollment = async (
    program: HealthProgram,
    retryCount = 0,
    maxRetries = 2
  ): Promise<boolean> => {
    console.log(`Enrollment attempt ${retryCount + 1}/${maxRetries + 1}`);

    try {
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

      if (response.ok) {
        console.log("Enrollment successful!");
        // Update state with new enrolled program
        setEnrolledPrograms((prev) => [...prev, program.id]);

        // Update enrollment count for this program
        setProgramEnrollmentCounts((prev) => ({
          ...prev,
          [program.id]: (prev[program.id] || 0) + 1,
        }));

        // Also update localStorage
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

        // Navigate to the my-programs page
        router.push(`/my-programs`);
        return true;
      }

      // Handle errors based on status code
      console.warn(`Enrollment failed with status: ${response.status}`);

      if (response.status === 401) {
        console.log("Authentication error during enrollment");

        if (retryCount < maxRetries) {
          try {
            console.log("Trying to refresh token before retrying enrollment");
            const refreshSuccess = await refreshAuthToken();

            if (refreshSuccess) {
              console.log("Token refreshed, retrying enrollment");
              // Add a small delay before retry to allow state to update
              await new Promise((resolve) => setTimeout(resolve, 500));
              return attemptEnrollment(program, retryCount + 1, maxRetries);
            } else {
              console.log(
                "Token refresh failed, redirecting to register participant"
              );
              // Redirect to register-participant instead of login if token refresh fails
              router.push("/register-participant");
              return false;
            }
          } catch (refreshError) {
            console.error("Error during token refresh:", refreshError);
          }
        }

        // Prevent showing an alert (which blocks navigation) and directly redirect
        console.log(
          "Authentication failed. Redirecting to register-participant page."
        );
        // Redirect to register-participant instead of login
        router.push("/register-participant");
        return false;
      }

      // For non-auth errors, try to get the error message from the response
      let errorMessage = "Failed to enroll in program";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;

        // Check for specific error cases and provide better user messages
        if (errorMessage === "Program has reached maximum enrollment limit") {
          alert(
            `Program "${program.name}" telah mencapai batas maksimum peserta. Silakan pilih program lain.`
          );
          return false;
        }
      } catch (e) {
        console.warn("Could not parse error response");
      }

      throw new Error(errorMessage);
    } catch (error) {
      console.error(`Enrollment attempt ${retryCount + 1} error:`, error);
      throw error;
    }
  };

  // Get unique categories from programs
  const programCategories = programs
    .filter((program) => program.category?.name)
    .map((program) => program.category!.name);

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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
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
              <h2 className="text-2xl font-bold text-black mb-2">
                Tidak dapat memuat program kesehatan
              </h2>
              <p className="text-black mb-6">{error}</p>
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Program Kesehatan & Kebugaran
            </h1>
            <p className="text-lg text-black max-w-3xl mx-auto">
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
                    <span className="ml-1 text-sm font-medium text-black md:ml-2">
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
      <section className="py-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-black mb-6 text-center">
              Pilih Kategori Program
            </h2>

            {loading ? (
              <div className="flex space-x-2 justify-center">
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
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
      <section className="py-12 bg-white" id="programs-section">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black">
              Program Kesehatan Tersedia
            </h2>
            <p className="mt-2 text-lg text-black max-w-2xl mx-auto">
              {selectedCategory === "Semua"
                ? "Berbagai program kesehatan yang tersedia untuk Anda"
                : `Program kesehatan dalam kategori "${selectedCategory}"`}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-black">Memuat program kesehatan...</p>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <div
                      key={program.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
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
                            <p className="text-sm text-gray-500 mt-1">
                              Durasi:{" "}
                              {calculateDuration(
                                program.startDate,
                                program.endDate
                              )}
                            </p>
                          </div>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {program.maxParticipants
                              ? `${programEnrollmentCounts[program.id] || 0}/${
                                  program.maxParticipants
                                } peserta`
                              : "Tidak dibatasi"}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-black mb-2">
                          {program.name}
                        </h3>
                        <p className="text-black mb-4 line-clamp-3">
                          {program.description}
                        </p>

                        <div className="flex justify-between items-center mt-6">
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

                          {!user ? (
                            <Link
                              href={`/login`}
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                            >
                              Daftar Sekarang
                            </Link>
                          ) : isEnrolled(program.id) ? (
                            <Link
                              href={`/my-programs`}
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                              Program Saya
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleEnroll(program)}
                              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                            >
                              Ikuti Program
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <img
                        src="/images/empty-programs.svg"
                        alt="Tidak ada program"
                        className="w-48 h-48 mx-auto mb-6"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/192x192?text=No+Programs";
                        }}
                      />
                      <h3 className="text-xl font-bold text-black mb-3">
                        Belum Ada Program Kesehatan
                      </h3>
                      <p className="text-black mb-6 max-w-md mx-auto">
                        {selectedCategory !== "Semua"
                          ? `Saat ini tidak ada program kesehatan yang tersedia dalam kategori "${selectedCategory}". Silakan pilih kategori lain atau kembali nanti.`
                          : "Saat ini belum ada program kesehatan yang tersedia. Silakan periksa kembali dalam waktu dekat untuk program baru."}
                      </p>
                      {selectedCategory !== "Semua" && (
                        <button
                          onClick={() => setSelectedCategory("Semua")}
                          className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium text-sm transition-colors"
                        >
                          Lihat Semua Program
                        </button>
                      )}

                      {/* Info box for patients */}
                      {user &&
                        user.role === "participant" &&
                        selectedCategory === "Semua" && (
                          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-blue-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                  Informasi untuk pasien
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                  <p className="text-left">
                                    Program kesehatan baru akan tersedia segera.
                                    Anda akan mendapatkan notifikasi ketika
                                    program baru ditambahkan. Untuk sementara,
                                    Anda dapat berkonsultasi dengan dokter atau
                                    penyedia layanan kesehatan Anda untuk
                                    rekomendasi program kesehatan.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
