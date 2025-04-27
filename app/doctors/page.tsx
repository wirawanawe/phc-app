"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DoctorCard from "../components/DoctorCard";
import { getDictionary } from "../lib/dictionary";

interface Dictionary {
  doctors: {
    title: string;
    description: string;
  };
  common: {
    menu: {
      home: string;
    };
  };
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  rating: number;
  availability: string;
  scheduleData?: string | null;
}

// List of practice days - will be replaced with dynamic data from API
// const practiceDays = [
//   { value: "", label: "Semua Hari" },
//   { value: "Sen", label: "Senin" },
//   { value: "Sel", label: "Selasa" },
//   { value: "Rab", label: "Rabu" },
//   { value: "Kam", label: "Kamis" },
//   { value: "Jum", label: "Jumat" },
//   { value: "Sab", label: "Sabtu" },
// ];

// Rating filter options
const ratingOptions = [
  { value: 0, label: "Semua Rating" },
  { value: 4.5, label: "4.5 & ke atas" },
  { value: 4, label: "4.0 & ke atas" },
  { value: 3.5, label: "3.5 & ke atas" },
  { value: 3, label: "3.0 & ke atas" },
];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] =
    useState("Semua Spesialisasi");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);
  const [practiceDays, setPracticeDays] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "Semua Hari" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/public/doctors");

        if (response.ok) {
          const data = await response.json();
          setDoctors(data);
        } else {
          setError("Failed to fetch doctors data");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch specialties from the API
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch("/api/public/specializations");
        if (response.ok) {
          const data = await response.json();
          setSpecialties([{ id: "all", name: "Semua Spesialisasi" }, ...data]);
        } else {
          console.error("Failed to fetch specialties");
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
      }
    };

    fetchSpecialties();
  }, []);

  // Fetch practice days from the API
  useEffect(() => {
    const fetchPracticeDays = async () => {
      try {
        const response = await fetch("/api/public/practice-days");
        if (response.ok) {
          const data = await response.json();
          setPracticeDays(data);
        } else {
          console.error("Failed to fetch practice days");
        }
      } catch (err) {
        console.error("Error fetching practice days:", err);
      }
    };

    fetchPracticeDays();
  }, []);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary("id");
      setDictionary(dict as Dictionary);
    };

    loadDictionary();
  }, []);

  // Fallback text
  const text = {
    title: dictionary?.doctors?.title || "Temukan Dokter",
    description:
      dictionary?.doctors?.description ||
      "Temukan dan konsultasikan dengan dokter terbaik yang sesuai dengan kebutuhan kesehatan Anda.",
    home: dictionary?.common?.menu?.home || "Beranda",
    findDoctors: "Cari Dokter",
    searchPlaceholder: "Cari berdasarkan nama dokter...",
    noDoctorsFound: "Tidak ada dokter yang ditemukan",
    adjustSearch:
      "Coba sesuaikan pencarian atau filter untuk menemukan yang Anda cari.",
    resetFilters: "Reset filter",
    joinTeam: "Bergabung dengan Tim Medis Kami",
    joinDescription:
      "Kami selalu mencari profesional kesehatan berbakat untuk bergabung dengan tim kami. Jika Anda memiliki passion dalam memberikan perawatan berkualitas, kami ingin mendengar dari Anda.",
    exploreCareer: "Jelajahi Peluang Karir",
    filterByDay: "Filter berdasarkan hari praktek",
  };

  // Helper function to check if doctor practices on selected day
  const doctorPracticesOnDay = (doctor: Doctor, day: string): boolean => {
    if (!day || !doctor.scheduleData) return true;

    try {
      const schedule = JSON.parse(doctor.scheduleData);
      console.log(`Checking if doctor ${doctor.name} practices on ${day}`, {
        schedule,
        type: Array.isArray(schedule) ? "array" : typeof schedule,
      });

      // Handle array format (new format)
      if (Array.isArray(schedule)) {
        const result = schedule.includes(day);
        console.log(`Array format - includes ${day}: ${result}`);
        return result;
      }

      // Handle object format (old format)
      if (typeof schedule === "object" && schedule !== null) {
        const keys = Object.keys(schedule);
        const result = keys.includes(day);
        console.log(
          `Object format - keys: ${keys.join(
            ", "
          )} - includes ${day}: ${result}`
        );
        return result;
      }

      console.log("Unknown schedule format");
      return false;
    } catch (error) {
      console.error(`Error parsing schedule data for ${doctor.name}:`, error);

      // Fallback - check if the day appears in availability string
      const result = doctor.availability.includes(day);
      console.log(
        `Fallback to availability string: ${doctor.availability} - includes ${day}: ${result}`
      );
      return result;
    }
  };

  // Filter doctors based on search term, specialty, practice day, and rating
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "Semua Spesialisasi" ||
      doctor.specialty === selectedSpecialty;
    const matchesDay =
      selectedDay === "" || doctorPracticesOnDay(doctor, selectedDay);
    const matchesRating =
      selectedRating === 0 || doctor.rating >= selectedRating;

    return matchesSearch && matchesSpecialty && matchesDay && matchesRating;
  });

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedSpecialty("Semua Spesialisasi");
    setSelectedDay("");
    setSelectedRating(0);
  };

  // Count how many filters are active
  const activeFilterCount = [
    searchTerm !== "",
    selectedSpecialty !== "Semua Spesialisasi",
    selectedDay !== "",
    selectedRating !== 0,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {text.title}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {text.description}
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
                    {text.home}
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
                      {text.findDoctors}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            {/* Desktop filters */}
            <div className="hidden md:block mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Filter Pencarian
                  </h2>

                  {/* Search */}
                  <div className="mb-5">
                    <label
                      htmlFor="search"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Kata Kunci
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>
                      <input
                        id="search"
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full ps-10 p-2.5 focus:ring-primary focus:border-primary"
                        placeholder={text.searchPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Specialty filter */}
                    <div>
                      <label
                        htmlFor="specialty"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Spesialisasi
                      </label>
                      <select
                        id="specialty"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
                      >
                        {specialties.map((specialty) => (
                          <option key={specialty.id} value={specialty.name}>
                            {specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day filter */}
                    <div>
                      <label
                        htmlFor="practice-day"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Hari Praktik
                      </label>
                      <select
                        id="practice-day"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
                        aria-label={text.filterByDay}
                      >
                        {practiceDays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rating filter */}
                    <div>
                      <label
                        htmlFor="rating"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Rating
                      </label>
                      <select
                        id="rating"
                        value={selectedRating}
                        onChange={(e) =>
                          setSelectedRating(Number(e.target.value))
                        }
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
                      >
                        {ratingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reset filters button */}
                  {(searchTerm ||
                    selectedSpecialty !== "Semua Spesialisasi" ||
                    selectedDay !== "" ||
                    selectedRating !== 0) && (
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={resetAllFilters}
                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        {text.resetFilters}
                      </button>
                    </div>
                  )}
                </div>

                {/* Result summary */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Menampilkan{" "}
                    <span className="font-medium">
                      {filteredDoctors.length}
                    </span>{" "}
                    dari <span className="font-medium">{doctors.length}</span>{" "}
                    dokter
                  </p>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {activeFilterCount > 0 ? (
                      <span>{activeFilterCount} filter aktif</span>
                    ) : (
                      <span>Tidak ada filter aktif</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile filter button */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
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
                  <span className="font-medium">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isFilterOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Mobile filters panel */}
              {isFilterOpen && (
                <div className="mt-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    {/* Search */}
                    <div>
                      <label
                        htmlFor="mobile-search"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Kata Kunci
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            fill="none"
                            viewBox="0 0 20 20"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                          </svg>
                        </div>
                        <input
                          id="mobile-search"
                          type="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full ps-10 p-2.5"
                          placeholder={text.searchPlaceholder}
                        />
                      </div>
                    </div>

                    {/* Specialty filter */}
                    <div>
                      <label
                        htmlFor="mobile-specialty"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Spesialisasi
                      </label>
                      <select
                        id="mobile-specialty"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                      >
                        {specialties.map((specialty) => (
                          <option key={specialty.id} value={specialty.name}>
                            {specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day filter */}
                    <div>
                      <label
                        htmlFor="mobile-day"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Hari Praktik
                      </label>
                      <select
                        id="mobile-day"
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                      >
                        {practiceDays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rating filter */}
                    <div>
                      <label
                        htmlFor="mobile-rating"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Rating
                      </label>
                      <select
                        id="mobile-rating"
                        value={selectedRating}
                        onChange={(e) =>
                          setSelectedRating(Number(e.target.value))
                        }
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                      >
                        {ratingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between pt-4">
                      <button
                        onClick={resetAllFilters}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Reset semua
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                      >
                        Terapkan Filter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active filters display */}
            {(searchTerm ||
              selectedSpecialty !== "Semua Spesialisasi" ||
              selectedDay !== "" ||
              selectedRating !== 0) && (
              <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <span>Kata kunci: {searchTerm}</span>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1.5 text-primary hover:text-primary-dark"
                        aria-label="Remove search filter"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedSpecialty !== "Semua Spesialisasi" && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <span>Spesialisasi: {selectedSpecialty}</span>
                      <button
                        onClick={() =>
                          setSelectedSpecialty("Semua Spesialisasi")
                        }
                        className="ml-1.5 text-primary hover:text-primary-dark"
                        aria-label="Remove specialty filter"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedDay && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <span>
                        Hari Praktek:{" "}
                        {
                          practiceDays.find((d) => d.value === selectedDay)
                            ?.label
                        }
                      </span>
                      <button
                        onClick={() => setSelectedDay("")}
                        className="ml-1.5 text-primary hover:text-primary-dark"
                        aria-label="Remove day filter"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {selectedRating > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      <span className="flex items-center">
                        Rating: {selectedRating}+
                        <svg
                          className="h-3 w-3 text-yellow-400 ml-1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                      <button
                        onClick={() => setSelectedRating(0)}
                        className="ml-1.5 text-primary hover:text-primary-dark"
                        aria-label="Remove rating filter"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:underline"
                >
                  {text.resetFilters}
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="text-center p-8">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary hover:underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {/* Show doctors */}
            {!loading && !error && (
              <>
                {filteredDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        id={doctor.id}
                        name={doctor.name}
                        specialty={doctor.specialty}
                        imageUrl={doctor.imageUrl}
                        rating={doctor.rating}
                        availability={doctor.availability}
                        scheduleData={doctor.scheduleData}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {text.noDoctorsFound}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {text.adjustSearch}
                    </p>
                    <button
                      onClick={resetAllFilters}
                      className="text-primary hover:underline"
                    >
                      {text.resetFilters}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Join our team section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {text.joinTeam}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {text.joinDescription}
            </p>
            <div className="mt-8">
              <Link href="/careers" className="btn btn-primary">
                {text.exploreCareer}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
