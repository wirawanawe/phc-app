"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#E32345] text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo doctorPHC.jpg"
              alt="PHC Logo"
              width={100}
              height={100}
              className="mr-2"
            />
            <span className="font-medium text-lg">
              Paltform Kesehatan Pribadi
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="https://facebook.com" className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </Link>
            <Link href="https://twitter.com" className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </Link>
            <Link href="https://instagram.com" className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link href="https://youtube.com" className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="bg-transparent hover:bg-gray-800 hover:bg-opacity-30 p-2 rounded-full font-medium text-sm flex items-center justify-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-[#E32345] to-[#FF6B6B] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {(user.fullName || user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-black bg-opacity-90 rounded-lg shadow-lg z-10 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-700 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#E32345] to-[#FF6B6B] rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {(user.fullName || user.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-gray-300 text-sm mt-0.5">
                            {user.email || "email@phc.com"}
                          </p>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center px-6 py-2.5 text-sm text-white hover:bg-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-3"
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
                          Profil Saya
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="flex items-center px-6 py-2.5 text-sm text-white hover:bg-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-3"
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
                          Pengaturan
                        </Link>
                        <Link
                          href="/my-programs"
                          className="flex items-center px-6 py-2.5 text-sm text-white hover:bg-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                          Program Saya
                        </Link>
                        {hasRole(user.role, "admin") && (
                          <Link
                            href="/admin"
                            className="flex items-center px-6 py-2.5 text-sm text-white hover:bg-gray-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Admin
                          </Link>
                        )}
                        <div className="border-t border-gray-700 my-2"></div>
                        <button
                          onClick={logout}
                          className="flex items-center w-full text-left px-6 py-2.5 text-sm text-[#FF6B6B] hover:bg-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-transparent text-white border border-white hover:bg-gray-800 hover:bg-opacity-30 px-4 py-1 rounded-md font-medium text-sm"
              >
                Masuk/ Daftar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-black">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-14">
            <div className="hidden md:flex justify-center space-x-8">
              <NavLink href="/" active={pathname === "/"}>
                BERANDA
              </NavLink>
              <NavLink
                href="/appointments"
                active={pathname === "/appointments"}
              >
                JANJI TEMU
              </NavLink>
              <NavLink href="/doctors" active={pathname === "/doctors"}>
                CARI DOKTER
              </NavLink>
              <NavLink
                href="/wellness"
                active={pathname === "/wellness" || pathname === "/health-info"}
              >
                INFORMASI KESEHATAN
              </NavLink>
              <NavLink href="/contact" active={pathname === "/contact"}>
                HUBUNGI KAMI
              </NavLink>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-white focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-80">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/" active={pathname === "/"}>
                BERANDA
              </MobileNavLink>
              <MobileNavLink
                href="/appointments"
                active={pathname === "/appointments"}
              >
                JANJI TEMU
              </MobileNavLink>
              <MobileNavLink href="/doctors" active={pathname === "/doctors"}>
                CARI DOKTER
              </MobileNavLink>
              <MobileNavLink
                href="/wellness"
                active={pathname === "/wellness" || pathname === "/health-info"}
              >
                INFORMASI KESEHATAN
              </MobileNavLink>
              <MobileNavLink href="/contact" active={pathname === "/contact"}>
                HUBUNGI KAMI
              </MobileNavLink>

              {user && (
                <>
                  <MobileNavLink href="/profile">PROFIL</MobileNavLink>
                  <MobileNavLink href="/profile/settings">
                    PENGATURAN
                  </MobileNavLink>
                  <MobileNavLink href="/my-programs">
                    PROGRAM SAYA
                  </MobileNavLink>
                  {hasRole(user.role, "admin") && (
                    <MobileNavLink href="/admin">ADMIN</MobileNavLink>
                  )}
                  <button
                    onClick={logout}
                    className="text-[#E32345] font-medium text-sm py-2 text-left"
                  >
                    KELUAR
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium py-2 border-b-2 ${
        active
          ? "text-white border-[#E32345]"
          : "text-white border-transparent hover:border-[#E32345]"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium py-2 ${
        active ? "text-[#E32345]" : "text-white hover:text-[#E32345]"
      }`}
    >
      {children}
    </Link>
  );
}
