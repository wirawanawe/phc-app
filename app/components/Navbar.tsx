"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { hasRole } from "@/app/utils/roleHelper";
import { usePathname, useRouter } from "next/navigation";
import { useWebsiteSettings } from "@/app/contexts/WebsiteSettingsContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useWebsiteSettings();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    // Tutup menu utama dan dropdown profile ketika item di profile diklik
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleAppointmentsClick = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    router.push("/profile/appointments");
  };

  const handleMyProgramsClick = (e: React.MouseEvent) => {
    // Selalu tutup menu profile
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);

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

    // We don't need to call handleProfileClick here since we're already closing menus
  };

  return (
    <>
      {/* Mobile Header - Only show logo and app name */}
      <div className="bg-[#E32345] text-white md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Image
              src={settings?.logoUrl || "/logo doctorPHC.jpg"}
              alt="PHC Logo"
              width={70}
              height={70}
              className="mr-2"
            />
            <span className="font-medium text-lg">
              Platform Kesehatan Pribadi
            </span>
          </div>
        </div>
      </div>

      {/* Top Bar - hidden on mobile */}
      <div className="bg-[#E32345] text-white hidden md:block">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src={settings?.logoUrl || "/logo doctorPHC.jpg"}
              alt="PHC Logo"
              width={100}
              height={100}
              className="mr-2"
            />
            <span className="font-medium text-lg">
              Platform Kesehatan Pribadi
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {settings?.facebook && (
              <Link href={settings.facebook} className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Link>
            )}
            {settings?.twitter && (
              <Link href={settings.twitter} className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
            )}
            {settings?.instagram && (
              <Link href={settings.instagram} className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            )}
            {settings?.youtube && (
              <Link href={settings.youtube} className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </Link>
            )}
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
                          onClick={handleProfileClick}
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
                          href="/my-programs"
                          onClick={handleMyProgramsClick}
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
                        <Link
                          href="/profile/appointments"
                          onClick={handleAppointmentsClick}
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
                              d="M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Janji Temu
                        </Link>
                        {hasRole(user.role, "admin") && (
                          <Link
                            href="/admin"
                            className="flex items-center px-6 py-2.5 text-sm text-white hover:bg-gray-800"
                            onClick={handleProfileClick}
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
                          onClick={() => {
                            logout();
                            handleProfileClick();
                          }}
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
      <div className="bg-black hidden md:block">
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
              <NavLink
                href="/hubungi-kami"
                active={pathname === "/hubungi-kami"}
              >
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
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleMenuClick}
      >
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Image
                  src={settings?.logoUrl || "/logo doctorPHC.jpg"}
                  alt="PHC Logo"
                  width={40}
                  height={40}
                />
                <span className="font-medium">Menu</span>
              </div>
              <button
                onClick={handleMenuClick}
                className="text-gray-500 hover:text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                <MobileNavLink
                  href="/"
                  active={pathname === "/"}
                  onClick={handleMenuClick}
                >
                  Beranda
                </MobileNavLink>
                <MobileNavLink
                  href="/articles"
                  active={pathname === "/articles"}
                  onClick={handleMenuClick}
                >
                  Artikel
                </MobileNavLink>
                <MobileNavLink
                  href="/bmi-calculator"
                  active={pathname === "/bmi-calculator"}
                  onClick={handleMenuClick}
                >
                  Kalkulator BMI
                </MobileNavLink>
                <MobileNavLink
                  href="/health-programs"
                  active={pathname === "/health-programs"}
                  onClick={handleMenuClick}
                >
                  Program Kesehatan
                </MobileNavLink>
                <MobileNavLink
                  href="/about"
                  active={pathname === "/about"}
                  onClick={handleMenuClick}
                >
                  Tentang Kami
                </MobileNavLink>
                <MobileNavLink
                  href="/contact"
                  active={pathname === "/contact"}
                  onClick={handleMenuClick}
                >
                  Kontak
                </MobileNavLink>
              </nav>

              {user ? (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#E32345] to-[#FF6B6B] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {(user.fullName || user.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email || "email@phc.com"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={handleProfileClick}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/profile/appointments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={handleProfileClick}
                    >
                      Janji Temu
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={handleProfileClick}
                    >
                      Pengaturan
                    </Link>
                    <Link
                      href="/my-programs"
                      onClick={handleMyProgramsClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Program Saya
                    </Link>
                    {hasRole(user.role, "admin") && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={handleProfileClick}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        handleProfileClick();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-2 bg-[#E32345] text-white rounded-lg hover:bg-[#c51e3b]"
                    onClick={handleMenuClick}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-4 py-2 mt-2 text-[#E32345] border border-[#E32345] rounded-lg hover:bg-[#E32345] hover:text-white"
                    onClick={handleMenuClick}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add padding for mobile bottom navigation */}
      <div className="md:hidden h-16"></div>
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
  onClick,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 text-sm rounded-lg ${
        active ? "bg-[#E32345] text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
