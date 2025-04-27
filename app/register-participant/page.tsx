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
  });

  // Pre-fill email if user is already logged in
  useEffect(() => {
    if (user && user.email) {
      setFormData((prevData) => ({
        ...prevData,
        email: user.email,
        name: user.fullName || "",
      }));
    }
  }, [user]);

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
      if (!user) {
        throw new Error("Anda harus login terlebih dahulu");
      }

      // Call API to register user as participant
      const response = await fetch("/api/register-participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Gagal mendaftar sebagai participant"
        );
      }

      // Update user role in auth context
      await updateUserRole("participant");

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

  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Anda harus login terlebih dahulu
          </h1>
          <p className="text-gray-600 mb-6">
            Silakan login untuk mendaftar sebagai participant
          </p>
          <Link
            href="/login"
            className="btn bg-primary text-white px-6 py-2 rounded"
          >
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // If user is already a participant, redirect to health programs
  if (user.role === "participant") {
    router.push("/health-programs");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
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
              <label htmlFor="dateOfBirth" className="block text-gray-700 mb-2">
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

            <div className="mb-6">
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

            <div className="mb-6">
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
      <Footer />
    </div>
  );
}
