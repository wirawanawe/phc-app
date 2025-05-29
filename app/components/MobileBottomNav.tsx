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
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-card-translucent border-t border-border backdrop-blur-md">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Home */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-xs font-medium min-w-0 flex-1"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-200 ${
              isActive("/")
                ? "bg-primary shadow-medium"
                : "bg-transparent hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isActive("/") ? "text-white" : "text-muted-foreground"
              }`}
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
            className={`mt-1 text-xs truncate transition-colors ${
              isActive("/")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Programs */}
        <Link
          href="/health-programs"
          className="flex flex-col items-center justify-center text-xs font-medium min-w-0 flex-1"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-200 ${
              isActive("/health-programs")
                ? "bg-primary shadow-medium"
                : "bg-transparent hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isActive("/health-programs")
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
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
            className={`mt-1 text-xs truncate transition-colors ${
              isActive("/health-programs")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Program
          </span>
        </Link>

        {/* Appointments */}
        <Link
          href="/appointments"
          className="flex flex-col items-center justify-center text-xs font-medium min-w-0 flex-1"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-200 ${
              isActive("/appointments")
                ? "bg-primary shadow-medium"
                : "bg-transparent hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isActive("/appointments")
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
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
            className={`mt-1 text-xs truncate transition-colors ${
              isActive("/appointments")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Janji
          </span>
        </Link>

        {/* Doctors */}
        <Link
          href="/doctors"
          className="flex flex-col items-center justify-center text-xs font-medium min-w-0 flex-1"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-200 ${
              isActive("/doctors")
                ? "bg-primary shadow-medium"
                : "bg-transparent hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isActive("/doctors") ? "text-white" : "text-muted-foreground"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <span
            className={`mt-1 text-xs truncate transition-colors ${
              isActive("/doctors")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            Dokter
          </span>
        </Link>

        {/* Profile */}
        <div className="relative flex flex-col items-center justify-center min-w-0 flex-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex flex-col items-center justify-center text-xs font-medium w-full"
          >
            <div
              className={`p-2 rounded-xl transition-all duration-200 ${
                isActive("/profile") || showProfileMenu
                  ? "bg-primary shadow-medium"
                  : "bg-transparent hover:bg-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  isActive("/profile") || showProfileMenu
                    ? "text-white"
                    : "text-muted-foreground"
                }`}
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
              className={`mt-1 text-xs truncate transition-colors ${
                isActive("/profile") || showProfileMenu
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Profil
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-16 right-0 w-48 bg-card border border-border rounded-xl shadow-strong z-50 overflow-hidden animate-slide-up">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-border bg-gray-800">
                    <p className="text-foreground font-semibold text-sm">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">
                      {user.email || "email@phc.com"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-gray-700 transition-colors"
                      onClick={closeProfileMenu}
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profil Saya
                    </Link>

                    <Link
                      href="/my-programs"
                      className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-gray-700 transition-colors"
                      onClick={handleMyProgramsClick}
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Program Saya
                    </Link>
                    {hasRole(user.role, "admin") && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-gray-700 transition-colors"
                        onClick={closeProfileMenu}
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeProfileMenu();
                        logout();
                      }}
                      className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7"
                        />
                      </svg>
                      Keluar
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-gray-700"
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
