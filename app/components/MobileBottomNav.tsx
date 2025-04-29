"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";
import { useState } from "react";

export default function MobileBottomNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const closeProfileMenu = () => {
    setShowProfileMenu(false);
  };

  const handleMyProgramsClick = (e: React.MouseEvent) => {
    // Close the profile menu
    closeProfileMenu();

    // Only handle for users who are logged in
    if (!user) return;

    // If user isn't a participant, prevent default navigation and show alert
    if (user.role !== "participant") {
      e.preventDefault();
      alert(
        "Hanya akun participant yang dapat mengakses program kesehatan. Silakan daftar sebagai participant terlebih dahulu."
      );
      router.push("/register-participant");
      return;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#121212] border-t border-gray-800">
      <div className="flex justify-around items-center h-16">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-xs font-medium"
        >
          <div
            className={`p-1.5 rounded-full ${
              isActive("/") ? "bg-[#E32345]" : "bg-transparent"
            }`}
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span
            className={`mt-1 ${
              isActive("/") ? "text-[#E32345]" : "text-gray-400"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Health Programs */}
        <Link
          href="/health-programs"
          className="flex flex-col items-center justify-center text-xs font-medium"
        >
          <div
            className={`p-1.5 rounded-full ${
              isActive("/health-programs") ? "bg-[#E32345]" : "bg-transparent"
            }`}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <span
            className={`mt-1 ${
              isActive("/health-programs") ? "text-[#E32345]" : "text-gray-400"
            }`}
          >
            Programs
          </span>
        </Link>

        {/* Doctors */}
        <Link
          href="/doctors"
          className="flex flex-col items-center justify-center text-xs font-medium"
        >
          <div
            className={`p-1.5 rounded-full ${
              isActive("/doctors") ? "bg-[#E32345]" : "bg-transparent"
            }`}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span
            className={`mt-1 ${
              isActive("/doctors") ? "text-[#E32345]" : "text-gray-400"
            }`}
          >
            Doctors
          </span>
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex flex-col items-center justify-center text-xs font-medium"
          >
            <div
              className={`p-1.5 rounded-full ${
                isActive("/profile") ? "bg-[#E32345]" : "bg-transparent"
              }`}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span
              className={`mt-1 ${
                isActive("/profile") ? "text-[#E32345]" : "text-gray-400"
              }`}
            >
              Profil
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-16 right-0 w-48 bg-black bg-opacity-90 rounded-lg shadow-lg z-50 overflow-hidden">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-white font-medium">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-gray-300 text-xs mt-0.5">
                      {user.email || "email@phc.com"}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                      onClick={closeProfileMenu}
                    >
                      Profil Saya
                    </Link>

                    <Link
                      href="/my-programs"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                      onClick={handleMyProgramsClick}
                    >
                      Program Saya
                    </Link>
                    {hasRole(user.role, "admin") && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={closeProfileMenu}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeProfileMenu();
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={closeProfileMenu}
                  >
                    Masuk / Daftar
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
