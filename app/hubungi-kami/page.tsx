"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useWebsiteSettings } from "@/app/contexts/WebsiteSettingsContext";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactUs() {
  const { settings } = useWebsiteSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>();
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

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
    <main className="min-h-screen bg-transparent">
      <Navbar />

      <div className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Tim kami siap membantu Anda. Silahkan hubungi kami melalui formulir
            di bawah ini, email, atau WhatsApp untuk informasi lebih lanjut.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Kirim Pesan</h2>

            {submitStatus === "success" && (
              <div className="bg-green-900 text-green-100 p-4 rounded-md mb-6">
                Terima kasih! Pesan Anda telah terkirim. Kami akan menghubungi
                Anda segera.
              </div>
            )}

            {submitStatus === "error" && (
              <div className="bg-red-900 text-red-100 p-4 rounded-md mb-6">
                Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami
                melalui WhatsApp.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Nama Lengkap</label>
                <input
                  {...register("name", { required: "Nama wajib diisi" })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  {...register("email", {
                    required: "Email wajib diisi",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Format email tidak valid",
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan alamat email"
                  type="email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Subjek</label>
                <input
                  {...register("subject", { required: "Subjek wajib diisi" })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                  placeholder="Masukkan subjek pesan"
                />
                {errors.subject && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Pesan</label>
                <textarea
                  {...register("message", { required: "Pesan wajib diisi" })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E32345] min-h-32"
                  placeholder="Masukkan pesan Anda"
                  rows={6}
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E32345] hover:bg-[#FF6B6B] text-white font-semibold py-3 px-6 rounded-md transition duration-300 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></span>
                ) : null}
                {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Informasi Kontak
            </h2>

            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                    <h3 className="text-white font-medium text-lg">Telepon</h3>
                    <p className="text-gray-300 mt-1">
                      {settings?.phone || "+62 21 1234 5678"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                    <h3 className="text-white font-medium text-lg">Email</h3>
                    <a
                      href={`mailto:${settings?.email || "support@phc.com"}`}
                      className="text-gray-300 mt-1 hover:text-[#FF6B6B]"
                    >
                      {settings?.email || "support@phc.com"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                    <h3 className="text-white font-medium text-lg">Alamat</h3>
                    <p className="text-gray-300 mt-1">
                      {settings?.address ||
                        "Jl. Kesehatan No. 123, Jakarta, Indonesia"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-[#E32345] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
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
                    <h3 className="text-white font-medium text-lg">
                      Jam Kerja
                    </h3>
                    <p className="text-gray-300 mt-1 whitespace-pre-line">
                      {settings?.workingHours ||
                        "Senin - Jumat: 08.00 - 17.00\nSabtu: 09.00 - 15.00\nMinggu: Tutup"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={openWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-md transition duration-300 flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6 mr-2"
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

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Lokasi Kami</h2>
          <div
            className="bg-gray-800 p-2 rounded-lg shadow-lg overflow-hidden"
            style={{ height: "400px" }}
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

      <Footer />
    </main>
  );
}
