"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

// Define interfaces for the data types
interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  spesialization?: string;
  specializationId?: string;
}

interface Specialization {
  id: string;
  name: string;
  isActive: boolean;
}

export default function AppointmentForm() {
  const { user } = useAuth(); // Ambil data user dari context

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    department: "",
    doctorId: "",
    notes: "",
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [loadingParticipant, setLoadingParticipant] = useState(false);

  // Function to get specialization name from id
  const getSpecializationName = (specializationId: string) => {
    const spec = specializations.find((s) => s.id === specializationId);
    return spec ? spec.name : specializationId;
  };

  // Check if the user has a participant profile
  useEffect(() => {
    const checkParticipantProfile = async () => {
      if (user) {
        setLoadingParticipant(true);
        try {
          // Try to fetch the participant profile
          const response = await fetch(`/api/participants/check-profile`);
          if (response.ok) {
            const data = await response.json();
            setParticipantId(data.participantId);
          } else {
            console.log("User does not have a participant profile");
            setParticipantId(null);
          }
        } catch (error) {
          console.error("Error checking participant profile:", error);
          setParticipantId(null);
        } finally {
          setLoadingParticipant(false);
        }
      }
    };

    checkParticipantProfile();
  }, [user]);

  // Fetch specializations when component mounts
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await fetch("/api/public/specializations");
        if (response.ok) {
          const data = await response.json();
          setSpecializations(data);
        }
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchSpecializations();
  }, []);

  // Fetch doctors data when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/public/doctors");
        if (response.ok) {
          const data = await response.json();
          setAllDoctors(data);
          setDoctors(data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors when department changes
  useEffect(() => {
    if (formData.department && allDoctors.length > 0) {
      console.log("Filtering doctors by department:", formData.department);
      // Filter by either specialty or spesialization id
      const filtered = allDoctors.filter(
        (doctor) =>
          doctor.specialty === formData.department ||
          doctor.spesialization === formData.department ||
          doctor.specializationId === formData.department
      );
      setDoctors(filtered.length > 0 ? filtered : allDoctors);
    } else {
      setDoctors(allDoctors);
    }
  }, [formData.department, allDoctors]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Reset doctorId when department changes
    if (name === "department") {
      setFormData((prev) => ({ ...prev, [name]: value, doctorId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!user) {
      setError("Anda harus login terlebih dahulu untuk membuat janji temu");
      setIsSubmitting(false);
      return;
    }

    if (!participantId) {
      setError(
        "Anda harus mendaftar sebagai peserta terlebih dahulu untuk membuat janji temu"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the appointment through admin API
      const appointmentResponse = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId: participantId, // Use the participant ID instead of user ID
          doctorId: formData.doctorId,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          status: "scheduled",
        }),
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form
      setFormData({
        date: "",
        time: "",
        department: "",
        doctorId: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create appointment. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Tampilkan pesan login jika user belum login
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-black">
            Login Diperlukan
          </h3>
          <p className="mt-2 text-black">
            Anda perlu login terlebih dahulu untuk membuat janji temu dengan
            dokter kami.
          </p>
          <div className="mt-6">
            <Link
              href="/login?redirect=/appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Login Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan pesan untuk mendaftar sebagai participant jika belum
  if (user && !loadingParticipant && !participantId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-black">
            Pendaftaran Peserta Diperlukan
          </h3>
          <p className="mt-2 text-black">
            Anda perlu mendaftar sebagai peserta terlebih dahulu untuk membuat
            janji temu dengan dokter kami.
          </p>
          <div className="mt-6">
            <Link
              href="/register-participant"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Daftar Sebagai Peserta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan loading jika sedang mengecek profile peserta
  if (loadingParticipant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-primary"
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
          </div>
          <p className="mt-4 text-black">Memeriksa profil peserta Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-300"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
            Janji Temu Berhasil Dibuat!
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Terima kasih telah membuat janji temu dengan kami. Kami akan
            mengirimkan email konfirmasi segera.
          </p>

          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Buat Janji Temu Lainnya
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Detail Janji Temu
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* User Information (prefilled and disabled) */}
            {user && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
                <h3 className="text-md font-medium text-black mb-2">
                  Informasi Pasien
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Nama
                    </label>
                    <p className="text-black">
                      {user.fullName || user.username || ""}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Email
                    </label>
                    <p className="text-black">{user.email || ""}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-black"
              >
                Departemen
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Pilih Departemen</option>
                {specializations.length > 0 ? (
                  specializations
                    .filter((spec) => spec.isActive)
                    .map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))
                ) : (
                  // Fallback to hardcoded departments if API fails
                  <>
                    <option value="Cardiology">Kardiologi</option>
                    <option value="Neurology">Neurologi</option>
                    <option value="Pediatrics">Pediatri</option>
                    <option value="Dermatology">Dermatologi</option>
                    <option value="Orthopedics">Ortopedi</option>
                    <option value="Gynecology">Ginekologi</option>
                    <option value="Ophthalmology">Oftalmologi</option>
                    <option value="Dentistry">Gigi</option>
                    <option value="General Medicine">Umum</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="doctorId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Dokter
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Pilih Dokter</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} -{" "}
                    {doctor.specialty ||
                      doctor.spesialization ||
                      getSpecializationName(doctor.specializationId || "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tanggal
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Waktu
              </label>
              <input
                id="time"
                name="time"
                type="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Catatan Tambahan
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Silahkan berikan informasi tambahan tentang keluhan yang Anda alami"
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Memproses...
                </>
              ) : (
                "Buat Janji Temu"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
