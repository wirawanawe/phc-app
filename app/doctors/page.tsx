"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import DoctorCard from "@/app/components/DoctorCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  rating: number;
  availability: string;
  scheduleData?: string | null;
}

interface Specialization {
  id: string;
  name: string;
  isActive: boolean;
}

// Define the available practice days
const PRACTICE_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [specialties, setSpecialties] = useState<Specialization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderInterval = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch all data on page load
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch all specializations
        const specialtyResponse = await fetch("/api/public/specializations");
        if (!specialtyResponse.ok) {
          console.error("Failed to fetch specializations");
        } else {
          const specialtyData = await specialtyResponse.json();
          setSpecialties(specialtyData);
        }

        // Fetch all doctors
        const doctorResponse = await fetch("/api/public/doctors");
        if (doctorResponse.ok) {
          const doctorData = await doctorResponse.json();
          setDoctors(doctorData);
          setError(null);
        } else {
          console.error("Failed to fetch doctors");
          setError("Gagal memuat data dokter. Silakan coba lagi nanti.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Check if doctor is available on the selected day
  const isDoctorAvailableOnDay = (doctor: Doctor, day: string): boolean => {
    if (!day || day === "") return true;
    if (!doctor.scheduleData) return false;

    try {
      const scheduleData = JSON.parse(doctor.scheduleData);

      if (Array.isArray(scheduleData)) {
        return scheduleData.includes(day);
      } else if (typeof scheduleData === "object") {
        return Object.keys(scheduleData).includes(day);
      }

      return false;
    } catch (error) {
      console.error("Error parsing schedule data:", error);
      return false;
    }
  };

  // Filter doctors based on search term, selected specialty, and practice day
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "" || doctor.specialty === selectedSpecialty;
    const matchesDay = isDoctorAvailableOnDay(doctor, selectedDay);

    return matchesSearch && matchesSpecialty && matchesDay;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setSelectedDay("");
  };

  // Setup slider auto-rotation
  useEffect(() => {
    // Start the slider rotation when component mounts
    startSliderRotation();

    // Cleanup interval on component unmount
    return () => {
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
    };
  }, []);

  // Function to start the slider rotation
  const startSliderRotation = useCallback(() => {
    if (sliderInterval.current) {
      clearInterval(sliderInterval.current);
    }

    sliderInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000); // Change slide every 5 seconds
  }, []);

  // Handle manual slide navigation
  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);

      // Reset the rotation timer when manually changing slides
      if (sliderInterval.current) {
        clearInterval(sliderInterval.current);
      }
      startSliderRotation();
    },
    [startSliderRotation]
  );

  // If there's an error loading doctors
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
                Tidak dapat memuat daftar dokter
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
              Temukan Dokter Terbaik
            </h1>
            <p className="text-lg text-black max-w-3xl mx-auto">
              Konsultasikan kesehatan Anda dengan dokter-dokter berkualitas dan
              berpengalaman untuk mendapatkan perawatan terbaik sesuai kebutuhan
              Anda.
            </p>
          </div>

          <div className="flex items-center justify-center">
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
                      Daftar Dokter
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <section
        className="py-10 bg-white border-b border-gray-500"
        id="filter-section"
      >
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black mb-6 text-center">
              Filter Pencarian Dokter
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter by Doctor Name */}
                <div>
                  <label
                    htmlFor="search"
                    className="block text-black mb-2 font-medium"
                  >
                    Nama Dokter
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Masukkan nama dokter..."
                    className="w-full border text-black border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter by Specialization */}
                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-black mb-2 font-medium"
                  >
                    Spesialisasi
                  </label>
                  <select
                    id="specialty"
                    className="w-full border text-black border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="">Semua Spesialisasi</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.name}>
                        {specialty.name} {!specialty.isActive && "(Nonaktif)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Practice Day */}
                <div>
                  <label
                    htmlFor="practiceDays"
                    className="block text-black mb-2 font-medium"
                  >
                    Hari Praktek
                  </label>
                  <select
                    id="practiceDays"
                    className="w-full border text-black border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="">Semua Hari</option>
                    {PRACTICE_DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedSpecialty || selectedDay) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center text-primary hover:text-primary-dark"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Hapus Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-12 bg-white" id="doctors-section">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-black">Dokter Tersedia</h2>
            <p className="mt-2 text-lg text-black max-w-2xl mx-auto">
              {filteredDoctors.length}
              {filteredDoctors.length === 1
                ? " dokter ditemukan"
                : " dokter ditemukan"}
              {selectedSpecialty && ` dengan spesialisasi ${selectedSpecialty}`}
              {selectedDay && ` yang praktek pada hari ${selectedDay}`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-black">Memuat daftar dokter...</p>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDoctors.length === 0 ? (
                  <div className="col-span-full">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <img
                        src="/images/doctor-empty.svg"
                        alt="Tidak ada dokter"
                        className="w-48 h-48 mx-auto mb-6"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 24 24'%3E%3Cpath fill='%239CA3AF' d='M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4'/%3E%3C/svg%3E";
                        }}
                      />
                      <h3 className="text-xl font-bold text-black mb-3">
                        Tidak Ada Dokter Ditemukan
                      </h3>
                      <p className="text-black mb-6 max-w-md mx-auto">
                        Tidak ada dokter yang sesuai dengan kriteria pencarian
                        Anda. Silakan ubah filter atau hapus beberapa filter
                        untuk melihat lebih banyak hasil.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium text-sm transition-colors"
                      >
                        Hapus Semua Filter
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      id={doctor.id}
                      name={doctor.name}
                      specialty={doctor.specialty}
                      imageUrl={
                        doctor.imageUrl || "/images/doctor-placeholder.svg"
                      }
                      rating={doctor.rating}
                      availability={doctor.availability}
                      scheduleData={doctor.scheduleData}
                    />
                  ))
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
