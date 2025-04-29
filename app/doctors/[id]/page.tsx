"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  rating: number;
  availability: string;
  phone?: string;
  email?: string;
  bio?: string;
  education?: string[];
  experience?: string[];
  scheduleData?: string | null;
}

interface Schedule {
  [key: string]: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<Schedule | string[] | null>(null);

  useEffect(() => {
    async function fetchDoctorDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/public/doctors/${params.id}`);

        if (response.ok) {
          const data = await response.json();
          setDoctor(data);

          // Parse schedule data if available
          if (data.scheduleData) {
            try {
              const parsedSchedule = JSON.parse(data.scheduleData);
              setSchedule(parsedSchedule);
            } catch (error) {
              console.error("Error parsing schedule data:", error);
            }
          }
        } else {
          console.error("Failed to fetch doctor details");
          // Redirect to doctors page if doctor not found
          if (response.status === 404) {
            router.push("/doctors");
          }
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchDoctorDetails();
    }
  }, [params.id, router]);

  // Format and render the schedule
  const renderSchedule = () => {
    if (!schedule) return null;

    // Determine days
    let days: string[] = [];
    if (Array.isArray(schedule)) {
      days = schedule;
    } else {
      days = Object.keys(schedule);
    }

    // Sort days
    const dayOrder: Record<string, number> = {
      Sen: 1,
      Sel: 2,
      Rab: 3,
      Kam: 4,
      Jum: 5,
      Sab: 6,
      Min: 7,
    };
    days.sort((a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99));

    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Jadwal Praktek</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {days.map((day) => (
            <div
              key={day}
              className="flex justify-between p-2 bg-white rounded-md"
            >
              <span className="font-medium">{day}</span>
              {!Array.isArray(schedule) && (
                <span className="text-gray-700">{schedule[day]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8 mb-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Dokter tidak ditemukan
            </h2>
            <p className="text-gray-500 mb-4">
              Dokter yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Link
              href="/doctors"
              className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Kembali ke Daftar Dokter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mb-16">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/doctors"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Daftar Dokter
          </Link>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-64 md:h-auto bg-gray-200">
                {doctor.imageUrl ? (
                  <Image
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="h-24 w-24 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6 md:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {doctor.name}
                    </h1>
                    <p className="text-primary text-lg">{doctor.specialty}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-100 rounded-full px-3 py-1 flex items-center shadow-sm">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 font-medium">
                      {doctor.rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-1">
                      Tentang Dokter
                    </h3>
                    <p className="text-gray-700">{doctor.bio}</p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center text-gray-700">
                      <svg
                        className="h-5 w-5 text-gray-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span>Praktek: {doctor.availability}</span>
                    </p>
                  </div>

                  {doctor.phone && (
                    <div>
                      <p className="flex items-center text-gray-700">
                        <svg
                          className="h-5 w-5 text-gray-500 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{doctor.phone}</span>
                      </p>
                    </div>
                  )}

                  {doctor.email && (
                    <div>
                      <p className="flex items-center text-gray-700">
                        <svg
                          className="h-5 w-5 text-gray-500 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{doctor.email}</span>
                      </p>
                    </div>
                  )}
                </div>

                {renderSchedule()}

                <div className="mt-6">
                  <Link
                    href={`/appointments?doctor=${doctor.id}`}
                    className="w-full block text-center bg-primary text-white px-4 py-3 rounded-md font-medium hover:bg-primary-dark transition-colors"
                  >
                    Booking Jadwal Konsultasi
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                {doctor.education && doctor.education.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pendidikan</h3>
                    <ul className="space-y-2">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-primary mr-2 mt-0.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doctor.experience && doctor.experience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pengalaman</h3>
                    <ul className="space-y-2">
                      {doctor.experience.map((exp, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-primary mr-2 mt-0.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                          </svg>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
