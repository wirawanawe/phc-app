"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SessionExpiredModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isOpen && countdown === 0) {
      handleLogin();
    }
  }, [isOpen, countdown]);

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sesi Telah Berakhir
          </h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {message ||
                    "Sesi login Anda telah berakhir. Harap login kembali untuk melanjutkan."}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Anda akan dialihkan ke halaman login dalam {countdown} detik.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLogin}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Login Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
