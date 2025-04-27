"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function BMICalculatorPage() {
  // State for BMI calculator
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [healthRisks, setHealthRisks] = useState<string[]>([]);

  // BMI calculation based on formula
  const calculateBMI = () => {
    if (weight && height) {
      const weightInKg = parseFloat(weight);
      const heightInM = parseFloat(height) / 100;

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
    setBmiResult(null);
    setBmiCategory("");
    setHealthRisks([]);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side - BMI Calculator */}
            <div className="w-full md:w-2/3">
              <div className="bg-[#E32345] text-white p-6 rounded-t-lg">
                <h1 className="text-3xl font-bold mb-2 text-white">
                  KALKULATOR BMI
                </h1>
                <p className="text-sm text-white">
                  Body Mass Index (BMI) adalah rumus untuk membantu menentukan
                  apakah berat badan seseorang sudah ideal dibandingkan dengan
                  tinggi badannya. Perhitungan ini banyak digunakan dan membantu
                  dokter untuk menilai status gizi dan risiko terhadap berbagai
                  penyakit, seperti diabetes, hipertensi, dan penyakit jantung.
                </p>
                <p className="text-sm mt-4 text-white">
                  Untuk menghitung BMI, seseorang tidak perlu memahami kondisi
                  tubuhnya, apakah terlihat kurus, normal, gemuk, atau obesitas.
                  Perhitungan BMI mudah dilakukan hanya dengan menggunakan berat
                  badan (dalam meter) dan tinggi badan (dalam meter)
                </p>
                <p className="text-xl font-medium mt-4 text-white">
                  1 menit untuk cek BMI, selamanya untuk hidup lebih sehat!
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-center mb-6">
                  <div className="flex gap-8">
                    <div
                      className={`flex flex-col items-center cursor-pointer ${
                        gender === "male" ? "opacity-100" : "opacity-50"
                      }`}
                      onClick={() => setGender("male")}
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image
                          src="/images/icon/manager.png"
                          alt="Male"
                          width={100}
                          height={100}
                        />
                      </div>
                      <span className="mt-2 font-medium text-black">
                        Laki-laki
                      </span>
                    </div>
                    <div
                      className={`flex flex-col items-center cursor-pointer ${
                        gender === "female" ? "opacity-100" : "opacity-50"
                      }`}
                      onClick={() => setGender("female")}
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image
                          src="/images/icon/hijab.png"
                          alt="Female"
                          width={100}
                          height={100}
                        />
                      </div>
                      <span className="mt-2 font-medium text-black">
                        Perempuan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Berat Badan (Kg) :
                    </label>
                    <input
                      type="number"
                      id="weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                      placeholder="Contoh: 70"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tinggi Badan (Cm) :
                    </label>
                    <input
                      type="number"
                      id="height"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E32345]"
                      placeholder="Contoh: 170"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={calculateBMI}
                    className="bg-[#E32345] text-white py-2 px-8 rounded-md hover:bg-[#C71C39] transition-colors font-medium"
                  >
                    Hitung BMI
                  </button>
                </div>
              </div>

              {bmiResult !== null && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-md">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-2 text-black">
                      Hasil :
                    </h2>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-medium text-black">
                          BMI untuk{" "}
                          {gender === "male" ? "Laki-laki" : "Perempuan"}
                        </p>
                        <p className="text-2xl font-bold text-[#E32345] mt-1">
                          {bmiCategory}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-black  ">
                          Tinggi (cm): {height}
                        </p>
                        <p className="text-sm text-black">
                          Berat (kg): {weight}
                        </p>
                        <p className="text-xl font-bold mt-1 text-black">
                          {bmiResult}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 relative">
                    {/* BMI Scale */}
                    <div className="h-8 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full mb-2 relative">
                      {/* Indicator */}
                      <div
                        className="absolute top-full w-4 h-4 bg-black transform -translate-x-1/2 rotate-45"
                        style={{
                          left: `${Math.min(
                            Math.max((bmiResult - 15) * 3, 5),
                            95
                          )}%`,
                          marginTop: "-8px",
                        }}
                      ></div>
                      <div className="absolute bottom-full left-0 text-xs font-medium text-black">
                        15
                      </div>
                      <div className="absolute bottom-full left-1/4 text-xs font-medium text-black">
                        18.5
                      </div>
                      <div className="absolute bottom-full left-1/2 text-xs font-medium text-black">
                        25
                      </div>
                      <div className="absolute bottom-full left-3/4 text-xs font-medium text-black">
                        30
                      </div>
                      <div className="absolute bottom-full right-0 text-xs font-medium text-black">
                        40
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-medium text-black">
                      Utamakan hidup sehat dan perhatikan konsumsi harian
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={resetBMI}
                        className="text-[#E32345] font-medium hover:underline"
                      >
                        Cek Ulang
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bmiResult !== null && bmiResult >= 25 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-black">
                        BMI kamu :{" "}
                        <span className="text-[#E32345]">
                          {bmiResult}, {bmiCategory}
                        </span>
                      </p>
                      <p className="mt-2 text-black">
                        Dalam 60% kasus,{" "}
                        <span className="text-[#E32345] font-medium">
                          pola makan yang buruk
                        </span>{" "}
                        dapat <span className="font-medium">berisiko </span>
                        Diabetes
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4 text-black">
                      Beberapa penyakit yang berasal dari kegemukan
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {healthRisks.map((risk, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-2 text-black"></span>
                          <span className="text-black">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="bg-[#E32345] text-white py-2 px-6 rounded-md hover:bg-[#C71C39] transition-colors">
                      Konsultasi Dokter Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Information */}
            <div className="w-full md:w-1/3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4 text-black">
                  BMI (Body Mass Index)
                </h2>
                <p className="text-sm mb-4 text-black">
                  BMI adalah singkatan dari Body Mass Index atau Indeks Massa
                  Tubuh (IMT) adalah suatu angka yang menunjukkan hubungan
                  antara berat badan seseorang dengan tinggi badannya. BMI
                  digunakan sebagai indikator sederhana untuk "normal apakah
                  seseorang" sederhana untuk:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4 text-black">
                  <li>Kekurangan berat badan</li>
                  <li>Memiliki berat badan normal</li>
                  <li>Kelebihan berat badan atau</li>
                  <li>Mengalami obesitas</li>
                </ul>

                <h3 className="text-lg font-bold mb-2 text-black">
                  Kalkulator BMI
                </h3>
                <p className="text-sm mb-4 text-black">
                  Kalkulator BMI adalah alat untuk mengidentifikasi apakah berat
                  badan kamu termasuk dalam kategori ideal atau tidak.
                  Kalkulator ini dapat digunakan oleh seseorang yang berusia 20
                  tahun ke atas.
                </p>

                <p className="text-sm font-medium mb-2 text-black">
                  Perlu diingat bahwa Kalkulator BMI ini tidak dapat
                  diaplikasikan untuk ibu hamil dan anak-anak karena standar BMI
                  yang berbeda.
                </p>

                <p className="text-sm mb-2 text-black">
                  Nilai yang perlu diperhatikan pada Kalkulator BMI:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-black">
                  <li>
                    Jika skor BMI dibawah 18.5, maka kamu memiliki berat badan
                    rendah
                  </li>
                  <li>BMI Normal berada pada kisaran 18.5-22.9</li>
                  <li>
                    Jika skor BMI berada di atas 23, maka kamu memiliki berat
                    badan berlebih
                  </li>
                  <li>
                    Jika angka BMI sudah melebihi angka 25, sebaiknya segera
                    dilakukan pemeriksaan untuk mencegah timbulnya penyakit
                  </li>
                </ul>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3 text-black">
                    Download Aplikasi
                  </h3>
                  <div className="flex space-x-2">
                    <Image
                      src="/google-play-badge.png"
                      alt="Get it on Google Play"
                      width={120}
                      height={36}
                      className="h-10 w-auto"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/120x36?text=Google+Play";
                      }}
                    />
                    <Image
                      src="/app-store-badge.png"
                      alt="Download on the App Store"
                      width={120}
                      height={36}
                      className="h-10 w-auto"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/120x36?text=App+Store";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
