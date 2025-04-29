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
                Tidak dapat memuat daftar dokter
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
              Temukan Dokter Terbaik
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Konsultasikan kesehatan Anda dengan dokter-dokter berkualitas dan
              berpengalaman untuk mendapatkan perawatan terbaik sesuai kebutuhan
              Anda.
            </p>
          </div>

          {/* Mobile Hero CTA - only visible on small screens */}
          <div className="md:hidden mt-6 mb-8">
            <div className="flex flex-col space-y-3">
              <Link
                href="/appointments"
                className="btn bg-primary hover:bg-primary-dark text-white px-6 py-3 font-medium rounded-lg text-center shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Buat Janji Dokter
                </div>
              </Link>

              <button
                onClick={() =>
                  document
                    .getElementById("filter-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn bg-white border border-primary text-primary hover:bg-gray-50 px-6 py-3 font-medium rounded-lg text-center shadow-sm"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter Dokter
                </div>
              </button>
            </div>
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
        className="py-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        id="filter-section"
      >
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Filter Pencarian Dokter
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter by Doctor Name */}
                <div>
                  <label
                    htmlFor="search"
                    className="block text-gray-700 dark:text-gray-300 mb-2 font-medium"
                  >
                    Nama Dokter
                  </label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Masukkan nama dokter..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter by Specialization */}
                <div>
                  <label
                    htmlFor="specialty"
                    className="block text-gray-700 dark:text-gray-300 mb-2 font-medium"
                  >
                    Spesialisasi
                  </label>
                  <select
                    id="specialty"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="block text-gray-700 dark:text-gray-300 mb-2 font-medium"
                  >
                    Hari Praktek
                  </label>
                  <select
                    id="practiceDays"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
      <section className="py-12 bg-white dark:bg-gray-800" id="doctors-section">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dokter Tersedia
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
              <p className="text-gray-600 dark:text-gray-300">
                Memuat daftar dokter...
              </p>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDoctors.length === 0 ? (
                  <div className="col-span-full">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                      <img
                        src="/images/doctor-empty.svg"
                        alt="Tidak ada dokter"
                        className="w-48 h-48 mx-auto mb-6"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 24 24'%3E%3Cpath fill='%239CA3AF' d='M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4'/%3E%3C/svg%3E";
                        }}
                      />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        Tidak Ada Dokter Ditemukan
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
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

      {/* Call to Action - Slider for Mobile */}
      <section className="py-16 bg-primary overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Desktop CTA */}
          <div className="hidden md:block text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Butuh Konsultasi Kesehatan?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Jangan tunda masalah kesehatan Anda. Konsultasikan dengan dokter
              terbaik kami dan dapatkan perawatan yang tepat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    href="/appointments"
                    className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium rounded-md"
                  >
                    Buat Janji Temu
                  </Link>
                  <Link
                    href="#doctors-section"
                    className="btn border border-white text-white hover:bg-white/10 px-6 py-3 font-medium rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("doctors-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Lihat Dokter
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
                  <Link
                    href="/login"
                    className="btn border border-white text-white hover:bg-white/10 px-6 py-3 font-medium rounded-md"
                  >
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Slider - only visible on mobile */}
          <div className="md:hidden">
            <div className="relative mx-auto max-w-md overflow-hidden">
              {/* Slide 1: Consultation */}
              <div
                className="absolute inset-0 transition-transform ease-in-out duration-500 min-w-full"
                style={{
                  transform: `translateX(${
                    currentSlide === 0
                      ? "0%"
                      : currentSlide === 1
                      ? "-100%"
                      : "-200%"
                  })`,
                  opacity: currentSlide === 0 ? 1 : 0,
                  zIndex: currentSlide === 0 ? 10 : 0,
                  pointerEvents: currentSlide === 0 ? "auto" : "none",
                }}
              >
                <div className="p-4">
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    Butuh Konsultasi Kesehatan?
                  </h2>
                  <p className="text-lg text-white/90 mb-6 text-center">
                    Jangan tunda masalah kesehatan Anda. Konsultasikan dengan
                    dokter terbaik kami.
                  </p>
                  <div className="flex justify-center">
                    {user ? (
                      <Link
                        href="/appointments"
                        className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium rounded-md"
                      >
                        Buat Janji Temu
                      </Link>
                    ) : (
                      <Link
                        href="/register"
                        className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium rounded-md"
                      >
                        Daftar Sekarang
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Slide 2: Mobile App */}
              <div
                className="absolute inset-0 transition-transform ease-in-out duration-500 min-w-full"
                style={{
                  transform: `translateX(${
                    currentSlide === 0
                      ? "100%"
                      : currentSlide === 1
                      ? "0%"
                      : "-100%"
                  })`,
                  opacity: currentSlide === 1 ? 1 : 0,
                  zIndex: currentSlide === 1 ? 10 : 0,
                  pointerEvents: currentSlide === 1 ? "auto" : "none",
                }}
              >
                <div className="mx-4">
                  <div className="bg-gradient-to-r from-blue-600 to-primary rounded-lg p-6">
                    <div className="flex flex-col items-center">
                      <h2 className="text-2xl font-bold text-white mb-3 text-center">
                        Unduh Aplikasi Mobile Kami
                      </h2>
                      <p className="text-white/90 mb-4 text-center">
                        Buat janji temu, konsultasi online, dan akses riwayat
                        kesehatan Anda kapan saja, di mana saja.
                      </p>
                      <div className="relative w-full h-40 my-4">
                        <Image
                          src="/mobile-app-mockup.png"
                          alt="PHC Mobile App"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <div className="flex space-x-3 mt-2">
                        <Link href="#" className="w-32 h-auto">
                          <Image
                            src="/app-store-badge.png"
                            alt="Download on App Store"
                            width={120}
                            height={35}
                          />
                        </Link>
                        <Link href="#" className="w-32 h-auto">
                          <Image
                            src="/google-play-badge.png"
                            alt="Get it on Google Play"
                            width={120}
                            height={35}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3: Special Promo */}
              <div
                className="absolute inset-0 transition-transform ease-in-out duration-500 min-w-full"
                style={{
                  transform: `translateX(${
                    currentSlide === 0
                      ? "200%"
                      : currentSlide === 1
                      ? "100%"
                      : "0%"
                  })`,
                  opacity: currentSlide === 2 ? 1 : 0,
                  zIndex: currentSlide === 2 ? 10 : 0,
                  pointerEvents: currentSlide === 2 ? "auto" : "none",
                }}
              >
                <div className="mx-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-6">
                    <div className="text-center">
                      <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium mb-3">
                        Promo Khusus
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">
                        Diskon 20% untuk Pemeriksaan Pertama
                      </h2>
                      <p className="text-white/90 mb-6">
                        Berlaku untuk pasien baru yang mendaftar melalui
                        aplikasi mobile kami.
                      </p>
                      <Link
                        href="/register"
                        className="inline-block bg-white text-purple-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
                      >
                        Klaim Sekarang
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Height spacer to maintain layout */}
              <div style={{ height: "320px" }} aria-hidden="true"></div>
            </div>

            {/* Slider Navigation Dots */}
            <div className="flex justify-center mt-6 space-x-3">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-white scale-110"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>

            {/* Slider Navigation Arrows */}
            <div className="flex justify-between mt-6 px-2">
              <button
                onClick={() => goToSlide((currentSlide - 1 + 3) % 3)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
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
              </button>
              <button
                onClick={() => goToSlide((currentSlide + 1) % 3)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Next slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
