"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AppointmentForm from "../components/AppointmentForm";
import Link from "next/link";
import { getDictionary } from "../lib/dictionary";

interface Dictionary {
  appointments: {
    title: string;
    description: string;
  };
  common: {
    menu: {
      home: string;
    };
  };
}

// Metadata should be in a separate layout file when using 'use client'
// export const metadata = {
//   title: "Buat Janji Temu - PHC Healthcare",
//   description: "Buat janji temu dengan spesialis kesehatan kami",
// };

export default function AppointmentsPage() {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary("id");
      setDictionary(dict as Dictionary);
    };

    loadDictionary();
  }, []);

  // Fallback text
  const text = {
    title: dictionary?.appointments?.title || "Buat Janji Temu Anda",
    description:
      dictionary?.appointments?.description ||
      "Jadwalkan konsultasi dengan spesialis kesehatan kami dengan cepat dan mudah.",
    home: dictionary?.common?.menu?.home || "Beranda",
    bookAppointment: "Buat Janji Temu",
    whyChooseUs: "Mengapa Memilih Kami",
    features: [
      "Tenaga medis berpengalaman",
      "Fasilitas medis modern",
      "Layanan kesehatan komprehensif",
      "Pendekatan perawatan berfokus pada pasien",
      "Peralatan medis canggih",
    ],
  };

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
                      {text.bookAppointment}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AppointmentForm />
            </div>

            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {text.whyChooseUs}
                </h3>

                <ul className="space-y-4">
                  {text.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-primary"
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
                      <p className="ml-3 text-gray-600 dark:text-gray-400">
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Butuh Bantuan?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tim layanan pelanggan kami siap membantu Anda dengan
                    berbagai pertanyaan.
                  </p>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary"
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
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      +62 (555) 123-4567
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
