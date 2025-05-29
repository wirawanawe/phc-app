"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatDate } from "../utils/dateUtils";

// Helper function to format time as the dateUtils import is causing an error
function formatTime(time: string): string {
  if (!time) return "-";

  // Extract hours and minutes from the time string
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time;

  return `${hours}:${minutes}`;
}

interface AppointmentQRCodeProps {
  appointment: {
    id: string;
    date: string;
    time: string;
    status: string;
    doctor: {
      id: string;
      name: string;
    };
    participantId: string;
  };
  size?: number; // Optional size parameter for QR code
}

export default function AppointmentQRCode({
  appointment,
  size = 120, // Default size is 120px
}: AppointmentQRCodeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Create appointment data to be encoded in QR code
  const appointmentData = JSON.stringify({
    appointmentId: appointment.id,
    doctorId: appointment.doctor?.id,
    doctorName: appointment.doctor?.name,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    participantId: appointment.participantId,
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className="p-2 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowDetails(!showDetails)}
      >
        <QRCodeSVG
          value={appointmentData}
          size={size}
          level="H"
          includeMargin={true}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
        />
      </div>

      {showDetails && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 text-center">
          <p className="font-medium">QR Code Appointment</p>
          <p className="mt-1">{appointment.doctor?.name || "Dokter"}</p>
          <p>
            {formatDate(new Date(appointment.date))},{" "}
            {formatTime(appointment.time)}
          </p>
          <p className="mt-1 text-primary text-[10px]">
            Tunjukkan QR code ini ke resepsionis
          </p>
        </div>
      )}
    </div>
  );
}
