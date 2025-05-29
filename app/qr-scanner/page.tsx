"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatDate } from "../utils/dateUtils";

interface AppointmentData {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  participantId: string;
}

export default function QRScannerPage() {
  const [scannedData, setScannedData] = useState<AppointmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize QR code scanner
    const qrCodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: Math.min(250, window.innerWidth - 50),
          height: Math.min(250, window.innerWidth - 50),
        },
      },
      false
    );

    qrCodeScanner.render(onScanSuccess, onScanError);
    scannerRef.current = qrCodeScanner;

    return () => {
      // Clean up scanner when component unmounts
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    try {
      // Parse the QR code data
      const appointmentData = JSON.parse(decodedText) as AppointmentData;
      setScannedData(appointmentData);
      verifyAppointment(appointmentData);
    } catch (error) {
      setError("Format QR code tidak valid");
      console.error("Error parsing QR code:", error);
    }
  };

  const onScanError = (errorMessage: string) => {
    // Handle scan error (usually just ignore as this happens when no QR code is detected)
    console.log("QR scan error:", errorMessage);
  };

  const verifyAppointment = async (data: AppointmentData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to verify appointment
      // In a real application, you would call an API endpoint to verify the appointment is valid
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if appointment status is scheduled
      if (data.status !== "scheduled") {
        setError(`Janji temu ini memiliki status: ${data.status}`);
        setIsVerified(false);
        return;
      }

      // Check if appointment date is today
      const appointmentDate = new Date(data.date);
      const today = new Date();

      // Reset time parts for accurate date comparison
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (appointmentDate.getTime() !== today.getTime()) {
        if (appointmentDate.getTime() < today.getTime()) {
          setError(
            `Janji temu ini sudah kedaluwarsa (${formatDate(appointmentDate)})`
          );
        } else {
          setError(
            `Janji temu ini untuk tanggal mendatang: ${formatDate(
              appointmentDate
            )}`
          );
        }
        setIsVerified(false);
        return;
      }

      // If all checks pass, mark as verified
      setIsVerified(true);
    } catch (error) {
      setError("Terjadi kesalahan saat memverifikasi janji temu");
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setError(null);
    setIsVerified(false);

    // Restart scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current.render(onScanSuccess, onScanError);
    }
  };

  // Helper to format time
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) return time;
    return `${hours}:${minutes}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl font-bold">Pemindai QR Code Janji Temu</h1>
            <p className="mt-2">
              Scan QR code pasien untuk memverifikasi janji temu
            </p>
          </div>

          <div className="p-6">
            {!scannedData ? (
              <div>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Arahkan kamera ke QR code pada perangkat pasien
                </p>
                <div
                  id="qr-reader"
                  className="mx-auto"
                  style={{ maxWidth: "500px" }}
                ></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  className={`p-4 rounded-lg ${
                    isVerified
                      ? "bg-green-50 dark:bg-green-900/20"
                      : "bg-yellow-50 dark:bg-yellow-900/20"
                  }`}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    Data Janji Temu
                  </h2>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      <span className="ml-2">Memverifikasi...</span>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">
                          {error}
                        </div>
                      )}

                      {isVerified && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-md mb-4 flex items-center">
                          <svg
                            className="h-5 w-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Janji temu terverifikasi!
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Dokter
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {scannedData.doctorName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Tanggal
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {formatDate(new Date(scannedData.date))}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Waktu
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {formatTime(scannedData.time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {scannedData.status}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            ID Appointment
                          </p>
                          <p className="text-gray-900 dark:text-gray-100 text-xs break-all">
                            {scannedData.appointmentId}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-900 dark:text-white transition-colors"
                  >
                    Scan Baru
                  </button>

                  {isVerified && (
                    <button
                      className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
                      onClick={() => alert("Check-in berhasil!")}
                    >
                      Check-in Pasien
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
