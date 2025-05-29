"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useWebsiteSettings } from "@/app/contexts/WebsiteSettingsContext";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactUs() {
  const { settings } = useWebsiteSettings();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [activeTab, setActiveTab] = useState<
    "home" | "service" | "article" | "profile" | "contact"
  >("contact");

  const onSubmit = async (data: FormData) => {
    try {
      // Here you would typically send the form data to your backend
      // For this example, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
    }
  };

  const openWhatsApp = () => {
    // Get whatsapp number from settings or use default
    const phoneNumber = settings?.whatsapp || "+6281234567890";
    const formattedPhone = phoneNumber.replace(/\+/g, "");
    const message = encodeURIComponent(
      "Halo, saya ingin mendapatkan informasi lebih lanjut tentang layanan PHC."
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-white pb-16 md:pb-0">
      {/* Desktop Only */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header - App Style */}
      <div className="md:hidden bg-[#E32345] text-white fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="p-2">
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Hubungi Kami</h1>
            <div className="w-6"></div> {/* Empty div for symmetry */}
          </div>
        </div>
      </div>

      {/* Mobile-friendly content */}
      <div className="md:bg-white py-4 md:py-16 mt-12 md:mt-0">
        <div className="container mx-auto px-4">
          <h1 className="hidden md:block text-4xl font-bold text-black mb-4 text-center">
            Hubungi Kami
          </h1>
          <p className="text-base md:text-lg text-black text-center max-w-3xl mx-auto mb-6 md:mb-0">
            Tim kami siap membantu Anda. Hubungi kami melalui channel berikut
            ini.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-4 md:py-12">
        {/* Mobile Quick Actions */}
        <div className="md:hidden mb-8">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={openWhatsApp}
              className="flex flex-col items-center bg-green-600 rounded-lg p-3 text-white"
            >
              <svg
                className="w-8 h-8 mb-1"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263" />
              </svg>
              <span className="text-xs">WhatsApp</span>
            </button>

            <a
              href={`tel:${settings?.phone || "+6281234567890"}`}
              className="flex flex-col items-center bg-blue-600 rounded-lg p-3 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-xs">Telepon</span>
            </a>

            <a
              href={`mailto:${settings?.email || "support@phc.com"}`}
              className="flex flex-col items-center bg-red-600 rounded-lg p-3 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">Email</span>
            </a>
          </div>
        </div>

        {/* Main Content - Desktop 2 column, Mobile stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-4 md:p-8 shadow-lg border border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">
              Kirim Pesan
            </h2>

            {submitStatus === "success" && (
              <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-md mb-4 md:mb-6 text-sm md:text-base">
                Terima kasih! Pesan Anda telah terkirim. Kami akan menghubungi
                Anda segera.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-100 text-red-800 p-3 md:p-4 rounded-md mb-4 md:mb-6 text-sm md:text-base">
                Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami
                melalui WhatsApp.
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div>
                <label className="block text-black mb-1 md:mb-2 text-sm md:text-base">
                  Nama Lengkap
                </label>
                <input
                  {...register("name", { required: "Nama wajib diisi" })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-md text-black text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs md:text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-black mb-1 md:mb-2 text-sm md:text-base">
                  Email
                </label>
                <input
                  {...register("email", {
                    required: "Email wajib diisi",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Format email tidak valid",
                    },
                  })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-md text-black text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan alamat email"
                  type="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs md:text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-black mb-1 md:mb-2 text-sm md:text-base">
                  Subjek
                </label>
                <input
                  {...register("subject", { required: "Subjek wajib diisi" })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-md text-black text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan subjek pesan"
                />
                {errors.subject && (
                  <p className="text-red-600 text-xs md:text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-black mb-1 md:mb-2 text-sm md:text-base">
                  Pesan
                </label>
                <textarea
                  {...register("message", { required: "Pesan wajib diisi" })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-md text-black text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan pesan Anda"
                  rows={4}
                />
                {errors.message && (
                  <p className="text-red-600 text-xs md:text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E32345] hover:bg-[#FF6B6B] text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-md transition duration-300 flex items-center justify-center text-sm md:text-base"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-white mr-2"></span>
                ) : null}
                {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">
              Informasi Kontak
            </h2>

            <div className="space-y-4 md:space-y-8">
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-black font-medium text-base md:text-lg">
                      Telepon
                    </h3>
                    <a
                      href={`tel:${settings?.phone || "+6281234567890"}`}
                      className="text-black mt-1 text-sm md:text-base hover:text-[#E32345]"
                    >
                      {settings?.phone || "+62 21 1234 5678"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-black font-medium text-base md:text-lg">
                      Email
                    </h3>
                    <a
                      href={`mailto:${settings?.email || "support@phc.com"}`}
                      className="text-black mt-1 text-sm md:text-base hover:text-[#E32345]"
                    >
                      {settings?.email || "support@phc.com"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-black font-medium text-base md:text-lg">
                      Alamat
                    </h3>
                    <p className="text-black mt-1 text-sm md:text-base">
                      {settings?.address ||
                        "Jl. Kesehatan No. 123, Jakarta, Indonesia"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 md:h-6 md:w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-black font-medium text-base md:text-lg">
                      Jam Kerja
                    </h3>
                    <p className="text-black mt-1 whitespace-pre-line text-sm md:text-base">
                      {settings?.workingHours ||
                        "Senin - Jumat: 08.00 - 17.00\nSabtu: 09.00 - 15.00\nMinggu: Tutup"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-md transition duration-300 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"
                    />
                  </svg>
                  Hubungi Kami di WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 md:mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">
            Lokasi Kami
          </h2>
          <div
            className="bg-white p-1 md:p-2 rounded-lg shadow-lg overflow-hidden border border-gray-200"
            style={{ height: "250px", maxHeight: "50vh" }}
          >
            {/* Use mapLocation from settings if available */}
            <iframe
              src={
                settings?.mapLocation ||
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126933.56208307289!2d106.7271068502019!3d-6.176921781125624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f436b8c94d63%3A0x6ea6d5398b7c784d!2sJakarta%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1667793998540!5m2!1sid!2sid"
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Desktop Footer only */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="flex justify-between px-2 py-2">
          <Link href="/" className="flex flex-col items-center w-1/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                activeTab === "home" ? "text-[#E32345]" : "text-gray-600"
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
            <span
              className={`text-[10px] mt-1 ${
                activeTab === "home" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Beranda
            </span>
          </Link>

          <Link
            href="/appointments"
            className="flex flex-col items-center w-1/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                activeTab === "service" ? "text-[#E32345]" : "text-gray-600"
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
            <span
              className={`text-[10px] mt-1 ${
                activeTab === "service" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Janji Temu
            </span>
          </Link>

          <Link href="/articles" className="flex flex-col items-center w-1/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                activeTab === "article" ? "text-[#E32345]" : "text-gray-600"
              }`}
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
              className={`text-[10px] mt-1 ${
                activeTab === "article" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Artikel
            </span>
          </Link>

          <Link
            href="/hubungi-kami"
            className="flex flex-col items-center w-1/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                activeTab === "contact" ? "text-[#E32345]" : "text-gray-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span
              className={`text-[10px] mt-1 ${
                activeTab === "contact" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Kontak
            </span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center w-1/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                activeTab === "profile" ? "text-[#E32345]" : "text-gray-600"
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
            <span
              className={`text-[10px] mt-1 ${
                activeTab === "profile" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Profil
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
