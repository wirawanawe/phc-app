"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getDictionary } from "../lib/dictionary";

export default function Hero() {
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

  return (
    <div className="bg-transparent">
      {/* Main Hero Section */}
      <div className="relative w-full h-[550px] overflow-hidden">
        <Image
          src="/family-running.png"
          alt="Family jogging together"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/1200x550/8FBCBB/ECEFF4?text=Family+Jogging";
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white bg-black/30 backdrop-blur-sm p-6 rounded-lg">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Seberapa Penting Menjalankan Hidup Sehat
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Menjalankan hidup sehat itu penting karena tubuh yang sehat
                adalah kunci untuk menjalani aktivitas sehari-hari dengan
                optimal, terhindar dari penyakit, dan menikmati hidup lebih lama
                dengan kualitas yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Health App Promotion & CTA Section */}
      <div className="bg-[#E32345] text-white py-12 px-20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* App Logo and Description */}
          <div className="w-full md:w-7/12 mb-8 md:mb-0 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3 mb-6 md:mb-0 flex justify-center">
              <Image
                src="/Logo doctorPHC.jpg"
                alt="PHC Logo"
                width={150}
                height={150}
                className="rounded-lg"
              />
            </div>
            <div className="w-full md:w-2/3 md:pl-6 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Pola Hidup Sehat</h2>
              <p className="text-lg mb-6">
                Yuk mulai hidup sehat dari sekarang! Download aplikasi pola
                hidup sehat dan temukan tips, jadwal olahraga, serta panduan
                makan sehat dalam satu genggaman!
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="#"
                  className="inline-block transition transform hover:scale-105"
                >
                  <Image
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={140}
                    height={42}
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
                    width={140}
                    height={42}
                    className="shadow-md rounded-md"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full md:w-4/12 md:ml-6">
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
                    href="/demo"
                    className="bg-[#E32345] text-white border border-white hover:bg-gray-100 font-medium py-1.5 px-4 rounded-md text-sm"
                  >
                    Jadwalkan Demo
                  </Link>
                  <Link
                    href="/contact"
                    className="bg-white border border-[#E32345] text-black hover:bg-white/10 font-medium py-1.5 px-4 rounded-md text-sm"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/notes.png"
                    alt="Catatan Kesehatan"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
              <h3 className="text-xl text-black font-bold mb-2">
                Catatan Kesehatan
              </h3>
              <p className="text-gray-600">
                Akses catatan kesehatan anda kapan saja dimana saja. Pantau
                riwayat kesehatan anda secara aman
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/doctor.png"
                    alt="Dokter Ahli"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
              <h3 className="text-xl text-black font-bold mb-2">Dokter Ahli</h3>
              <p className="text-gray-600">
                Terhubung dengan spesialis berpengalaman dari berbagai bidang
                medis untuk konsultasi berkualitas
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/calendar.png"
                    alt="Penjadwalan Mudah"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
              <h3 className="text-xl text-black font-bold mb-2">
                Penjadwalan Mudah
              </h3>
              <p className="text-gray-600">
                Buat dan kelola janji temu dengan mudah menggunakan sistem
                penjadwalan yang mudah
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Self Health Services Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-black font-bold text-center mb-10">
            Layanan Kesehatan Mandiri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href="/bmi-calculator"
              className="block transition transform hover:scale-105"
            >
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md h-full">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/bmi.png"
                    alt="Kalkulator BMI"
                    width={100}
                    height={100}
                  />
                </div>
                <h3 className="text-lg text-black font-semibold mb-2">
                  Kalkulator BMI
                </h3>
                <p className="text-gray-600 text-center">
                  Hitung indeks massa tubuh Anda untuk mengetahui apakah berat
                  badan Anda ideal
                </p>
              </div>
            </Link>

            <Link
              href="/mental-health"
              className="block transition transform hover:scale-105"
            >
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md h-full">
                <div className="rounded-full flex items-center justify-center">
                  <Image
                    src="/images/icon/mental-health.jpg"
                    alt="Evaluasi Kesehatan Mental"
                    width={100}
                    height={100}
                  />
                </div>
                <h3 className="text-lg text-black font-semibold mb-2">
                  Evaluasi Kesehatan Mental
                </h3>
                <p className="text-gray-600 text-center">
                  Lakukan skrining awal untuk kesehatan mental Anda menggunakan
                  kuesioner standar
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-black font-bold text-center mb-4">
            Apa Kata Pasien Kami
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Jangan hanya percaya kata-kata kami. Ini yang dikatakan pasien kami
            tentang pengalaman mereka.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-bold">M</span>
                </div>
                <div>
                  <h4 className="text-black font-bold">Michael Brown</h4>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Sistem pemesanan Janji Temu Online sangat nyaman. Saya bisa
                mengatur kunjungan dengan cepat, dokternya teliti, dan penuh
                perhatian"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
