"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDictionary } from "../lib/dictionary";

interface Dictionary {
  records: {
    title: string;
    description: string;
  };
  common: {
    menu: {
      home: string;
    };
  };
}

// Data catatan kesehatan tiruan
const healthRecordsData = [
  {
    id: "rec-001",
    date: "10 Jan 2023",
    doctor: "Dr. John Smith",
    type: "Pemeriksaan Umum",
    status: "Selesai",
  },
  {
    id: "rec-002",
    date: "05 Mar 2023",
    doctor: "Dr. Sarah Johnson",
    type: "Laboratorium",
    status: "Selesai",
  },
  {
    id: "rec-003",
    date: "22 Apr 2023",
    doctor: "Dr. Michael Lee",
    type: "Konsultasi",
    status: "Selesai",
  },
  {
    id: "rec-004",
    date: "15 Jun 2023",
    doctor: "Dr. Jessica Brown",
    type: "Vaksinasi",
    status: "Selesai",
  },
  {
    id: "rec-005",
    date: "30 Aug 2023",
    doctor: "Dr. Robert Williams",
    type: "Pemeriksaan Gigi",
    status: "Selesai",
  },
];

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState("health-records");
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
    title: dictionary?.records?.title || "Catatan Kesehatan Anda",
    description:
      dictionary?.records?.description ||
      "Kelola dan lihat riwayat medis Anda untuk pemantauan kesehatan yang lebih baik.",
    home: dictionary?.common?.menu?.home || "Beranda",
    records: "Catatan Kesehatan",
    tabs: {
      healthRecords: "Catatan Kesehatan",
      prescriptions: "Resep Obat",
      labResults: "Hasil Lab",
      invoices: "Tagihan",
    },
    noRecords: "Belum Ada Catatan",
    noRecordsDesc:
      "Catatan kesehatan Anda akan muncul di sini setelah Anda mengunjungi salah satu dari dokter kami.",
    schedule: "Jadwalkan Pemeriksaan",
    tableHeaders: {
      date: "Tanggal",
      doctor: "Dokter",
      type: "Jenis",
      status: "Status",
      action: "Tindakan",
    },
    viewDetails: "Lihat Detail",
    uploadDocs: "Unggah Dokumen Kesehatan",
    uploadDesc:
      "Unggah dokumen kesehatan dari penyedia lain untuk menyimpannya dalam sistem kami.",
    browse: "Pilih File",
    orDrag: "atau drag dan drop file di sini",
    supportedFormats: "Format yang didukung: PDF, JPG, PNG (maks. 10MB)",
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
                      {text.records}
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
          <div className="mb-8">
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "health-records"
                    ? "text-primary border-b-2 border-primary active"
                    : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("health-records")}
              >
                {text.tabs.healthRecords}
              </button>
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "prescriptions"
                    ? "text-primary border-b-2 border-primary active"
                    : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("prescriptions")}
              >
                {text.tabs.prescriptions}
              </button>
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "lab-results"
                    ? "text-primary border-b-2 border-primary active"
                    : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("lab-results")}
              >
                {text.tabs.labResults}
              </button>
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "invoices"
                    ? "text-primary border-b-2 border-primary active"
                    : "border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("invoices")}
              >
                {text.tabs.invoices}
              </button>
            </div>
          </div>

          {activeTab === "health-records" && (
            <>
              {healthRecordsData.length > 0 ? (
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="py-3 px-6">
                          {text.tableHeaders.date}
                        </th>
                        <th scope="col" className="py-3 px-6">
                          {text.tableHeaders.doctor}
                        </th>
                        <th scope="col" className="py-3 px-6">
                          {text.tableHeaders.type}
                        </th>
                        <th scope="col" className="py-3 px-6">
                          {text.tableHeaders.status}
                        </th>
                        <th scope="col" className="py-3 px-6">
                          {text.tableHeaders.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthRecordsData.map((record) => (
                        <tr
                          key={record.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="py-4 px-6">{record.date}</td>
                          <td className="py-4 px-6">{record.doctor}</td>
                          <td className="py-4 px-6">{record.type}</td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                              {record.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <a
                              href={`#record-${record.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {text.viewDetails}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {text.noRecords}
                  </h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {text.noRecordsDesc}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/appointments"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
                    >
                      {text.schedule}
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Other tab content would go here */}
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {text.uploadDocs}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {text.uploadDesc}
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center">
              <input type="file" className="hidden" id="file-upload" />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none cursor-pointer"
              >
                {text.browse}
              </label>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {text.orDrag}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {text.supportedFormats}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
