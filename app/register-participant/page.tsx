"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/AuthContext";

export default function RegisterParticipantPage() {
  const router = useRouter();
  const { user, updateUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    identityNumber: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isNewAccount, setIsNewAccount] = useState(false);

  // Pre-fill email if user is already logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData((prevData) => ({
        ...prevData,
        email: user.email,
        name: user.fullName || "",
      }));
      setIsNewAccount(false);
    } else {
      setIsNewAccount(true);
    }
  }, [user]);

  // Handle redirect if user is already a participant
  useEffect(() => {
    if (user && user.role === "participant") {
      router.push("/health-programs");
    }
  }, [user, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate password match for new accounts
      if (isNewAccount && formData.password !== formData.confirmPassword) {
        throw new Error("Password dan konfirmasi password tidak cocok");
      }

      // Call API to register user as participant
      const response = await fetch("/api/register-participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          user
            ? // If user is logged in, include userId
              {
                userId: user.id,
                ...formData,
              }
            : // If not logged in, send without userId
              {
                ...formData,
                createAccount: isNewAccount,
              }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Gagal mendaftar sebagai participant"
        );
      }

      const responseData = await response.json();

      // If user is logged in, update role
      if (user) {
        await updateUserRole("participant");
      } else if (responseData.token) {
        // Auto login the user with the returned token
        document.cookie = `phc_token=${responseData.token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`;

        // Reload the page to update auth context
        window.location.href = "/health-programs";
        return;
      }

      // Redirect to health programs page
      router.push("/health-programs");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mendaftar. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // If user is already a participant, show loading state instead of null
  if (user && user.role === "participant") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Logo section for mobile view */}
          <div className="md:hidden bg-[#E32345] p-6 flex items-center justify-center">
            <div className="text-center">
              <img
                src="/logo doctorPHC.jpg"
                alt="PHC Logo"
                className="mx-auto mb-4 w-[200px] h-[200px]"
              />
              <h3 className="text-2xl font-bold text-white mb-2">
                Bergabung dengan PHC
              </h3>
              <p className="text-blue-100">
                Jadilah participant dan dapatkan akses ke program kesehatan
                kami.
              </p>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Daftar sebagai Participant
            </h1>
            <p className="text-gray-600 mb-6">
              Lengkapi formulir berikut untuk mendaftar sebagai participant dan
              mengikuti program kesehatan.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="identityNumber"
                  className="block text-gray-700 mb-2"
                >
                  Nomor Identitas (KTP/Passport)
                </label>
                <input
                  type="text"
                  id="identityNumber"
                  name="identityNumber"
                  required
                  value={formData.identityNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-gray-700 mb-2"
                >
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Alamat
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Show password fields only for non-logged in users */}
              {isNewAccount && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-gray-700 mb-2"
                    >
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      Sudah memiliki akun?{" "}
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        Login di sini
                      </Link>
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Link
                  href="/health-programs"
                  className="mr-4 px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "Mendaftar..." : "Daftar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
