"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Proteksi halaman admin
  useEffect(() => {
    if (!user) {
      // Jika belum login, redirect ke halaman login
      router.push("/login");
      return;
    }

    // Jika bukan admin, redirect ke homepage
    if (!hasRole(user.role, "admin")) {
      router.push("/");
    }
  }, [user, router]);

  // Check if current path is under master data
  useEffect(() => {
    if (pathname.startsWith("/admin/master")) {
      setMasterDataOpen(true);
    }
  }, [pathname]);

  // Jika user belum terload atau bukan admin, tampilkan spinner
  if (!user || !hasRole(user.role, "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-primary text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1
            className={`font-bold text-xl truncate ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            PHC Admin
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="mt-6">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Dashboard
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/users"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Users
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/doctors"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/doctors"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Doctors
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/participants"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/participants"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Participants
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/appointments"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/appointments"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Appointments
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/health-programs"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/health-programs"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Health Programs
                </span>
              </Link>
            </li>

            {/* Articles Management */}
            <li>
              <Link
                href="/admin/articles"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/articles" ||
                  pathname.startsWith("/admin/articles/")
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Articles
                </span>
              </Link>
            </li>

            {/* Website Settings */}
            <li>
              <Link
                href="/admin/website-settings"
                className={`flex items-center py-3 px-4 ${
                  pathname === "/admin/website-settings"
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700"
                } rounded-none transition-colors duration-200 ${
                  isSidebarOpen ? "mx-2 px-4" : "mx-2 justify-center"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span
                  className={`ml-3 ${
                    isSidebarOpen ? "block" : "hidden"
                  } transition-opacity duration-300`}
                >
                  Website Settings
                </span>
              </Link>
            </li>

            {/* Master Data Menu with Dropdown */}
            <li className="relative">
              {isSidebarOpen ? (
                // Full sidebar view
                <>
                  <button
                    onClick={() => setMasterDataOpen(!masterDataOpen)}
                    className={`flex items-center justify-between w-full py-3 px-4 ${
                      pathname.startsWith("/admin/master")
                        ? "bg-blue-700 text-white"
                        : "text-white hover:bg-blue-700"
                    } rounded-none transition-colors duration-200 mx-2`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                      <span className="ml-3">Master Data</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        masterDataOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Submenu */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      masterDataOpen ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <ul className="mt-1 pl-4 pr-2">
                      <li>
                        <Link
                          href="/admin/master/spesialization"
                          className={`flex items-center py-2 px-4 text-sm ${
                            pathname === "/admin/master/spesialization"
                              ? "bg-blue-800 text-white"
                              : "text-blue-100 hover:bg-blue-800"
                          } rounded-md transition-colors duration-200`}
                        >
                          <span>Specialization</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/master/insurance"
                          className={`flex items-center py-2 px-4 text-sm ${
                            pathname === "/admin/master/insurance"
                              ? "bg-blue-800 text-white"
                              : "text-blue-100 hover:bg-blue-800"
                          } rounded-md transition-colors duration-200`}
                        >
                          <span>Insurance</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/master/program-categories"
                          className={`flex items-center py-2 px-4 text-sm ${
                            pathname === "/admin/master/program-categories"
                              ? "bg-blue-800 text-white"
                              : "text-blue-100 hover:bg-blue-800"
                          } rounded-md transition-colors duration-200`}
                        >
                          <span>Kategori Program</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                // Collapsed sidebar view - icon only
                <div className="relative group">
                  <button
                    className={`flex items-center justify-center py-3 px-2 mx-2 ${
                      pathname.startsWith("/admin/master")
                        ? "bg-blue-700 text-white"
                        : "text-white hover:bg-blue-700"
                    } rounded-none transition-colors duration-200`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </button>
                  <div className="absolute left-full top-0 ml-2 bg-blue-600 text-white rounded-md shadow-lg py-2 w-48 invisible group-hover:visible z-50">
                    <div className="flex items-center px-4 py-2 font-semibold border-b border-blue-500">
                      <span>Master Data</span>
                    </div>
                    <Link
                      href="/admin/master/spesialization"
                      className="block px-4 py-2 text-sm hover:bg-blue-700"
                    >
                      Specialization
                    </Link>
                    <Link
                      href="/admin/master/insurance"
                      className="block px-4 py-2 text-sm hover:bg-blue-700"
                    >
                      Insurance
                    </Link>
                    <Link
                      href="/admin/master/program-categories"
                      className="block px-4 py-2 text-sm hover:bg-blue-700"
                    >
                      Kategori Program
                    </Link>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl text-black font-semibold">
              Admin Dashboard
            </h2>
            <div>
              <Link href="/" className="px-4 py-2 text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
