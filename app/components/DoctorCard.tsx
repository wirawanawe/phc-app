import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  rating: number;
  availability: string;
  scheduleData?: string | null;
}

export default function DoctorCard({
  id,
  name,
  specialty,
  imageUrl,
  rating,
  availability,
  scheduleData,
}: DoctorCardProps) {
  // Format the schedule data for the tooltip
  const formatScheduleTooltip = (): ReactNode => {
    if (!scheduleData) return null;

    try {
      const schedule = JSON.parse(scheduleData);

      // Tentukan hari-hari yang tersedia
      let days: string[] = [];
      if (Array.isArray(schedule)) {
        days = schedule;
      } else if (typeof schedule === "object") {
        days = Object.keys(schedule);
      }

      // Urutkan hari secara logis
      const dayOrder: Record<string, number> = {
        Sen: 1,
        Sel: 2,
        Rab: 3,
        Kam: 4,
        Jum: 5,
        Sab: 6,
      };
      days.sort((a, b) => dayOrder[a] - dayOrder[b]);

      return (
        <div className="absolute left-0 right-0 bottom-full mb-2 z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 text-xs">
          <div className="font-medium mb-1 text-gray-900 dark:text-white">
            Hari Praktik:
          </div>
          <ul className="space-y-1">
            {days.map((day) => (
              <li key={day} className="flex justify-between">
                <span className="font-semibold">{day}</span>
                {!Array.isArray(schedule) &&
                  typeof schedule[day] === "string" && (
                    <span>{String(schedule[day])}</span>
                  )}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800"></div>
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 bg-gray-200 dark:bg-blue-200">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
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
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 flex items-center shadow-md">
          <svg
            className="h-4 w-4 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="ml-1 text-xs font-medium text-gray-900 dark:text-gray-100">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
          {name}
        </h3>
        <p className="text-sm text-primary">{specialty}</p>

        <div className="mt-4 relative group">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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
            <span>Praktek: {availability}</span>
            {scheduleData && (
              <button
                className="ml-1 text-primary hover:text-primary-dark"
                title="Lihat jadwal lengkap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
          {scheduleData && (
            <div className="hidden group-hover:block">
              {formatScheduleTooltip()}
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-3">
          <Link
            href={`/doctors/${id}`}
            className="flex-1 text-center bg-white dark:bg-white border border-primary text-primary dark:text-primary px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/appointments?doctor=${id}`}
            className="flex-1 text-center bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
