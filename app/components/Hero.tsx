"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getDictionary } from "../lib/dictionary";
import { useWebsiteSettings } from "@/app/contexts/WebsiteSettingsContext";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  author: string;
  isPublished: boolean;
  publishedDate: string | null;
  createdAt: string;
}

export default function Hero() {
  const { settings } = useWebsiteSettings();

  // State for BMI calculator
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [healthRisks, setHealthRisks] = useState<string[]>([]);

  // State for PHQ-9 mental health assessment
  const [phqAnswers, setPhqAnswers] = useState<number[]>(Array(9).fill(0));
  const [phqScore, setPhqScore] = useState<number | null>(null);
  const [phqCategory, setPhqCategory] = useState("");
  const [phqRecommendation, setPhqRecommendation] = useState("");

  // State for articles
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Mobile menu state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State for mobile view
  const [activeTab, setActiveTab] = useState<
    "home" | "service" | "article" | "profile"
  >("home");

  // BMI calculation based on Murni Teguh formula
  const calculateBMI = () => {
    if (weight && height && age) {
      const weightInKg = parseFloat(weight);
      const heightInM = parseFloat(height) / 100;
      const ageValue = parseFloat(age);

      // BMI formula: weight (kg) / (height (m) * height (m))
      const bmi = weightInKg / (heightInM * heightInM);
      setBmiResult(parseFloat(bmi.toFixed(1)));

      // Categorize BMI and set health risks
      if (bmi < 18.5) {
        setBmiCategory("Berat Badan Kurang");
        setHealthRisks([
          "Infertilitas",
          "Anemia",
          "Osteoporosis",
          "Sistem Imun Lemah",
        ]);
      } else if (bmi >= 18.5 && bmi < 25) {
        setBmiCategory("Berat Badan Normal");
        setHealthRisks([]);
      } else if (bmi >= 25 && bmi < 30) {
        setBmiCategory("Berat Badan Berlebih");
        setHealthRisks([
          "Diabetes",
          "Hipertensi",
          "Sakit Jantung",
          "Osteoarthritis",
        ]);
      } else {
        setBmiCategory("Obesitas");
        setHealthRisks([
          "Diabetes",
          "Hipertensi",
          "Sakit Jantung",
          "Osteoarthritis",
          "Sleep Apnea",
          "Stroke",
        ]);
      }
    } else {
      alert("Mohon isi semua data yang diperlukan");
    }
  };

  // Reset BMI calculator
  const resetBMI = () => {
    setGender("male");
    setWeight("");
    setHeight("");
    setAge("");
    setBmiResult(null);
    setBmiCategory("");
    setHealthRisks([]);
  };

  // PHQ-9 calculation
  const calculatePHQ9 = () => {
    const total = phqAnswers.reduce((sum, answer) => sum + answer, 0);
    setPhqScore(total);

    // Categorize depression severity based on PHQ-9 scoring
    if (total <= 4) {
      setPhqCategory("Tidak ada gejala depresi");
      setPhqRecommendation("Tidak memerlukan penanganan khusus");
    } else if (total >= 5 && total <= 9) {
      setPhqCategory("Depresi ringan");
      setPhqRecommendation("Pantau gejala dan evaluasi kembali jika memburuk");
    } else if (total >= 10 && total <= 14) {
      setPhqCategory("Depresi sedang");
      setPhqRecommendation(
        "Disarankan untuk berkonsultasi dengan profesional kesehatan mental"
      );
    } else if (total >= 15 && total <= 19) {
      setPhqCategory("Depresi cukup berat");
      setPhqRecommendation(
        "Segera konsultasikan diri ke profesional kesehatan mental"
      );
    } else {
      setPhqCategory("Depresi berat");
      setPhqRecommendation(
        "Sangat disarankan untuk segera mendapatkan penanganan profesional"
      );
    }
  };

  // Handle PHQ-9 question answer
  const handlePhqAnswer = (index: number, value: number) => {
    const newAnswers = [...phqAnswers];
    newAnswers[index] = value;
    setPhqAnswers(newAnswers);
  };

  // Reset PHQ-9 assessment
  const resetPHQ9 = () => {
    setPhqAnswers(Array(9).fill(0));
    setPhqScore(null);
    setPhqCategory("");
    setPhqRecommendation("");
  };

  // Toggle logged in state (for demo purposes)
  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const response = await fetch("/api/articles?published=true");

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        // Limit to 3 most recent articles
        const recentArticles = data.slice(0, 3);
        setArticles(recentArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        // Use fallback static content if API fails
        setArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Format date for articles
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-transparent">
      {/* Adjust margin for mobile */}

      {/* Main Hero Section - optimized for mobile */}
      <div className="relative w-full h-[300px] md:h-[550px] overflow-hidden">
        <Image
          src={
            settings?.heroBackgroundUrl &&
            settings.heroBackgroundUrl.startsWith("/")
              ? settings.heroBackgroundUrl
              : "/family-running.png"
          }
          alt="Family jogging together"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            console.error(
              "Failed to load hero image:",
              settings?.heroBackgroundUrl
            );
            e.currentTarget.src =
              "https://placehold.co/1200x550/8FBCBB/ECEFF4?text=Family+Jogging";
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white bg-black/50 backdrop-blur-sm p-4 md:p-6 rounded-lg">
              <h1 className="text-xl md:text-5xl font-bold mb-2 md:mb-6">
                Seberapa Penting Menjalankan Hidup Sehat
              </h1>
              <p className="text-sm md:text-xl mb-3 md:mb-8">
                Menjalankan hidup sehat itu penting karena tubuh yang sehat
                adalah kunci untuk menjalani aktivitas sehari-hari dengan
                optimal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Health App Promotion & CTA Section - mobile optimized */}
      <div className="bg-[#E32345] text-white py-6 md:py-12 px-4 md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* App Logo and Description */}
          <div className="w-full md:w-7/12 mb-6 md:mb-0 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3 mb-4 md:mb-0 flex justify-center">
              <Image
                src={
                  settings?.logoUrl && settings.logoUrl.startsWith("/")
                    ? settings.logoUrl
                    : "/Logo doctorPHC.jpg"
                }
                alt="PHC Logo"
                width={200}
                height={200}
                className="rounded-lg"
                onError={(e) => {
                  console.error(
                    "Failed to load logo image:",
                    settings?.logoUrl
                  );
                  e.currentTarget.src = "/Logo doctorPHC.jpg";
                }}
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-6 text-center md:text-left">
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
                Pola Hidup Sehat
              </h2>
              <p className="text-sm md:text-lg mb-3 md:mb-6">
                Yuk mulai hidup sehat dari sekarang! Download aplikasi pola
                hidup sehat dan temukan tips, jadwal olahraga, serta panduan
                makan sehat dalam satu genggaman!
              </p>
              <div className="flex flex-row justify-center md:justify-start space-x-3 md:space-x-4">
                <Link
                  href="#"
                  className="inline-block transition transform hover:scale-105"
                >
                  <Image
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={200}
                    height={50}
                    className="shadow-md rounded-md"
                  />
                </Link>
                <Link
                  href="#"
                  className="inline-block transition transform hover:scale-105"
                >
                  <Image
                    src="/app-store-badge.png"
                    alt="Download on the App Store"
                    width={200}
                    height={50}
                    className="shadow-md rounded-md"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section - hidden on mobile */}
          <div className="w-full md:w-4/12 md:ml-6 hidden md:block">
            <div className="bg-pink-200 p-5 md:p-6 rounded-lg shadow-md border border-pink-300">
              <div className="text-center md:text-left">
                <h2 className="text-2xl text-black font-bold mb-3">
                  Punya Pertanyaan?
                </h2>
                <p className="text-lg text-black mb-2">
                  Kami Siap Membantu 24 Jam
                </p>
                <p className="text-black mb-4 text-sm">
                  Tim Profesional Kesehatan kami tersedia sepanjang waktu untuk
                  kebutuhan Anda
                </p>

                <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
                  <Link
                    href="/hubungi-kami"
                    className="bg-[#E32345] text-white border border-white hover:bg-gray-100 font-medium py-1.5 px-4 rounded-md text-sm"
                  >
                    Hubungi Kami
                  </Link>
                  <Link
                    href="/appointments"
                    className="bg-white text-[#E32345] border border-[#E32345] hover:bg-[#E32345] hover:text-white font-medium py-1.5 px-4 rounded-md text-sm"
                  >
                    Buat Janji
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA Card - Only on mobile */}
      <div className="md:hidden bg-white p-4">
        <div className="bg-pink-100 p-4 rounded-lg shadow-sm border border-pink-200">
          <div className="flex items-center">
            <div className="rounded-full bg-pink-200 p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#E32345]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-black">
                Butuh Bantuan?
              </h3>
              <p className="text-xs text-black">
                Tim profesional kami siap membantu
              </p>
            </div>
            <Link
              href="/hubungi-kami"
              className="bg-[#E32345] text-white text-xs py-1 px-3 rounded-full"
            >
              Hubungi
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section - Simplified for mobile */}
      <div className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-black">
            Layanan Utama
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2 md:mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/notes.png"
                    alt="Catatan Kesehatan"
                    width={60}
                    height={60}
                    className="md:w-[100px] md:h-[100px]"
                  />
                </div>
              </div>
              <h3 className="text-sm md:text-xl text-black font-bold mb-1 md:mb-2">
                Catatan Kesehatan
              </h3>
              <p className="text-xs md:text-base text-black hidden md:block">
                Akses catatan kesehatan anda kapan saja dimana saja. Pantau
                riwayat kesehatan anda secara aman
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2 md:mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/doctor.png"
                    alt="Dokter Ahli"
                    width={60}
                    height={60}
                    className="md:w-[100px] md:h-[100px]"
                  />
                </div>
              </div>
              <h3 className="text-sm md:text-xl text-black font-bold mb-1 md:mb-2">
                Dokter Ahli
              </h3>
              <p className="text-xs md:text-base text-black hidden md:block">
                Terhubung dengan spesialis berpengalaman dari berbagai bidang
                medis untuk konsultasi berkualitas
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2 md:mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/calendar.png"
                    alt="Penjadwalan Mudah"
                    width={60}
                    height={60}
                    className="md:w-[100px] md:h-[100px]"
                  />
                </div>
              </div>
              <h3 className="text-sm md:text-xl text-black font-bold mb-1 md:mb-2">
                Penjadwalan
              </h3>
              <p className="text-xs md:text-base text-black hidden md:block">
                Buat dan kelola janji temu dengan mudah menggunakan sistem
                penjadwalan yang mudah
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Self Health Services Section - Optimized for mobile*/}
      <div className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl text-black font-bold text-center mb-6 md:mb-10">
            Layanan Kesehatan Mandiri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            <Link
              href="/bmi-calculator"
              className="block transition transform hover:scale-105"
            >
              <div className="flex items-center p-4 md:p-6 bg-white rounded-lg shadow-md">
                <div className="flex-shrink-0 mr-4">
                  <Image
                    src="/images/icon/bmi.png"
                    alt="Kalkulator BMI"
                    width={60}
                    height={60}
                    className="md:w-[100px] md:h-[100px]"
                  />
                </div>
                <div>
                  <h3 className="text-md md:text-lg text-black font-semibold mb-1 md:mb-2">
                    Kalkulator BMI
                  </h3>
                  <p className="text-xs md:text-base text-black">
                    Hitung indeks massa tubuh Anda
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/mental-health"
              className="block transition transform hover:scale-105"
            >
              <div className="flex items-center p-4 md:p-6 bg-white rounded-lg shadow-md">
                <div className="flex-shrink-0 mr-4">
                  <Image
                    src="/images/icon/mental-health.jpg"
                    alt="Evaluasi Kesehatan Mental"
                    width={60}
                    height={60}
                    className="md:w-[100px] md:h-[100px]"
                  />
                </div>
                <div>
                  <h3 className="text-md md:text-lg text-black font-semibold mb-1 md:mb-2">
                    Evaluasi Kesehatan Mental
                  </h3>
                  <p className="text-xs md:text-base text-black">
                    Lakukan skrining awal kesehatan mental
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Articles Section - Optimized for mobile */}
      <div className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-3xl text-black font-bold">
              Artikel Kesehatan
            </h2>
            <Link
              href="/articles"
              className="text-[#E32345] hover:text-red-600 font-medium text-sm md:text-base"
            >
              Lihat Semua →
            </Link>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-black">Memuat artikel...</p>
            </div>
          ) : articles.length > 0 ? (
            <>
              {/* Mobile article slider */}
              <div className="block md:hidden overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex space-x-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex-shrink-0 w-[280px]"
                    >
                      <div className="relative w-full h-40">
                        <Image
                          src={article.imageUrl || "/placeholder-image.jpg"}
                          alt={article.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-black">
                          {formatDate(article.publishedDate)}
                        </span>
                        <h3 className="text-md font-bold text-black mt-1 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-black mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-[#E32345] hover:text-red-600 font-medium text-sm"
                        >
                          Baca Selengkapnya
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop article grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={article.imageUrl || "/placeholder-image.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-black">
                        {formatDate(article.publishedDate)}
                      </span>
                      <h3 className="text-xl font-bold text-black mt-2 mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-base text-black mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-[#E32345] hover:text-red-600 font-medium"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Mobile article fallback slider */}
              <div className="block md:hidden overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex space-x-4">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex-shrink-0 w-[280px]">
                    <div className="relative w-full h-40">
                      <Image
                        src="/images/articles/healthy-lifestyle.jpg"
                        alt="Pola Hidup Sehat"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-black">12 Mei 2023</span>
                      <h3 className="text-md font-bold text-black mt-1 mb-2">
                        10 Cara Menerapkan Pola Hidup Sehat
                      </h3>
                      <p className="text-xs text-black mb-3 line-clamp-2">
                        Menerapkan pola hidup sehat adalah kunci untuk menjaga
                        kesehatan fisik dan mental.
                      </p>
                      <Link
                        href="/articles/10-cara-menerapkan-pola-hidup-sehat"
                        className="text-[#E32345] hover:text-red-600 font-medium text-sm"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex-shrink-0 w-[280px]">
                    <div className="relative w-full h-40">
                      <Image
                        src="/images/articles/mental-health.jpg"
                        alt="Kesehatan Mental"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-black">5 Juni 2023</span>
                      <h3 className="text-md font-bold text-black mt-1 mb-2">
                        Pentingnya Menjaga Kesehatan Mental
                      </h3>
                      <p className="text-xs text-black mb-3 line-clamp-2">
                        Kesehatan mental sama pentingnya dengan kesehatan fisik.
                      </p>
                      <Link
                        href="/articles/pentingnya-menjaga-kesehatan-mental"
                        className="text-[#E32345] hover:text-red-600 font-medium text-sm"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex-shrink-0 w-[280px]">
                    <div className="relative w-full h-40">
                      <Image
                        src="/images/articles/nutrition.jpg"
                        alt="Nutrisi Seimbang"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-black">20 Juli 2023</span>
                      <h3 className="text-md font-bold text-black mt-1 mb-2">
                        Panduan Nutrisi Seimbang
                      </h3>
                      <p className="text-xs text-black mb-3 line-clamp-2">
                        Memahami kebutuhan nutrisi tubuh adalah langkah penting
                        menuju kesehatan yang optimal.
                      </p>
                      <Link
                        href="/articles/panduan-nutrisi-seimbang"
                        className="text-[#E32345] hover:text-red-600 font-medium text-sm"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop article fallback grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="relative w-full h-48">
                    <Image
                      src="/images/articles/healthy-lifestyle.jpg"
                      alt="Pola Hidup Sehat"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-black">12 Mei 2023</span>
                    <h3 className="text-xl font-bold text-black mt-2 mb-3">
                      10 Cara Menerapkan Pola Hidup Sehat
                    </h3>
                    <p className="text-black mb-4 line-clamp-3">
                      Menerapkan pola hidup sehat adalah kunci untuk menjaga
                      kesehatan fisik dan mental. Artikel ini membahas
                      langkah-langkah sederhana yang dapat Anda terapkan dalam
                      kehidupan sehari-hari.
                    </p>
                    <Link
                      href="/articles/10-cara-menerapkan-pola-hidup-sehat"
                      className="text-[#E32345] hover:text-red-600 font-medium"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="relative w-full h-48">
                    <Image
                      src="/images/articles/mental-health.jpg"
                      alt="Kesehatan Mental"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-black">5 Juni 2023</span>
                    <h3 className="text-xl font-bold text-black mt-2 mb-3">
                      Pentingnya Menjaga Kesehatan Mental
                    </h3>
                    <p className="text-black mb-4 line-clamp-3">
                      Kesehatan mental sama pentingnya dengan kesehatan fisik.
                      Pelajari bagaimana cara mengenali gejala stres dan
                      kecemasan, serta strategi untuk mengelolanya secara
                      efektif.
                    </p>
                    <Link
                      href="/articles/pentingnya-menjaga-kesehatan-mental"
                      className="text-[#E32345] hover:text-red-600 font-medium"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  <div className="relative w-full h-48">
                    <Image
                      src="/images/articles/nutrition.jpg"
                      alt="Nutrisi Seimbang"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-black">20 Juli 2023</span>
                    <h3 className="text-xl font-bold text-black mt-2 mb-3">
                      Panduan Nutrisi Seimbang untuk Kesehatan Optimal
                    </h3>
                    <p className="text-black mb-4 line-clamp-3">
                      Memahami kebutuhan nutrisi tubuh adalah langkah penting
                      menuju kesehatan yang optimal. Artikel ini membahas
                      tentang macam-macam nutrisi penting dan cara
                      menyeimbangkannya.
                    </p>
                    <Link
                      href="/articles/panduan-nutrisi-seimbang"
                      className="text-[#E32345] hover:text-red-600 font-medium"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Testimonials Section - Simplified for mobile */}
      <div className="pt-8 pb-20 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl text-black font-bold text-center mb-2 md:mb-4">
            Apa Kata Pasien Kami
          </h2>
          <p className="text-center text-xs md:text-base text-black mb-6 md:mb-10 max-w-3xl mx-auto">
            Jangan hanya percaya kata-kata kami. Ini yang dikatakan pasien kami
            tentang pengalaman mereka.
          </p>

          {/* Mobile testimonial slider */}
          <div className="block md:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex space-x-4">
              <div className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 w-[260px]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">M</span>
                  </div>
                  <div>
                    <h4 className="text-sm text-black font-bold">
                      Michael Brown
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-black">
                  "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                  mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                  perhatian"
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 w-[260px]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <div>
                    <h4 className="text-sm text-black font-bold">
                      Sarah Johnson
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-black">
                  "Aplikasi ini sangat membantu. Saya bisa berkonsultasi dengan
                  dokter tanpa harus keluar rumah. Sangat praktis!"
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md flex-shrink-0 w-[260px]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">D</span>
                  </div>
                  <div>
                    <h4 className="text-sm text-black font-bold">David Lee</h4>
                  </div>
                </div>
                <p className="text-xs text-black">
                  "Fitur kalkulator BMI sangat membantu saya memantau berat
                  badan. Interface aplikasi juga sangat mudah digunakan."
                </p>
              </div>
            </div>
          </div>

          {/* Desktop testimonials grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-black mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-black mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-black mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Simplified and Always Visible */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="flex justify-between px-2 py-2">
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center w-1/4"
          >
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
          </button>

          <button
            onClick={() => setActiveTab("service")}
            className="flex flex-col items-center w-1/4"
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
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span
              className={`text-[10px] mt-1 ${
                activeTab === "service" ? "text-[#E32345]" : "text-gray-600"
              }`}
            >
              Layanan
            </span>
          </button>

          <button
            onClick={() => setActiveTab("article")}
            className="flex flex-col items-center w-1/4"
          >
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
          </button>

          <Link href="/profile" className="flex flex-col items-center w-1/4">
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
    </div>
  );
}
