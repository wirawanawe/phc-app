"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState } from "react";
import Link from "next/link";

export default function MentalHealthPage() {
  // State for PHQ-9 mental health assessment
  const [phqAnswers, setPhqAnswers] = useState<number[]>(Array(9).fill(0));
  const [phqScore, setPhqScore] = useState<number | null>(null);
  const [phqCategory, setPhqCategory] = useState("");
  const [phqRecommendation, setPhqRecommendation] = useState("");

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
    <main className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl text-black font-bold mb-4">
              Evaluasi Kesehatan Mental
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Skrining awal menggunakan kuesioner PHQ-9 untuk menilai gejala
              depresi
            </p>
          </div>

          <div className="flex items-center justify-center mb-10">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    Beranda
                  </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Evaluasi Kesehatan Mental
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <p className="text-gray-700 mb-6">
                PHQ-9 adalah kuesioner standar untuk mengevaluasi tingkat
                depresi. Jawablah seberapa sering Anda mengalami gejala berikut
                dalam 2 minggu terakhir.
              </p>

              <div className="space-y-6">
                {[
                  "Kurang berminat atau bergairah dalam melakukan apapun",
                  "Merasa sedih, murung, atau putus asa",
                  "Sulit tidur/mudah terbangun, atau terlalu banyak tidur",
                  "Merasa lelah atau kurang bertenaga",
                  "Kurang nafsu makan atau makan berlebihan",
                  "Merasa buruk tentang diri sendiri, merasa gagal, atau mengecewakan diri sendiri atau keluarga",
                  "Sulit berkonsentrasi pada sesuatu, seperti membaca koran atau menonton televisi",
                  "Bergerak atau berbicara sangat lambat sehingga orang lain memperhatikannya, atau sebaliknya (tidak bisa diam)",
                  "Memikirkan bahwa Anda lebih baik mati atau ingin melukai diri sendiri dengan cara apapun",
                ].map((question, index) => (
                  <div key={index}>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {index + 1}. {question}
                    </p>
                    <div className="flex flex-wrap gap-3 text-black">
                      {[
                        ["0", "Tidak pernah"],
                        ["1", "Beberapa hari"],
                        ["2", "Lebih dari setengah hari"],
                        ["3", "Hampir setiap hari"],
                      ].map(([value, label]) => (
                        <label key={value} className="flex items-center">
                          <input
                            type="radio"
                            name={`phq-q${index}`}
                            checked={phqAnswers[index] === parseInt(value)}
                            onChange={() =>
                              handlePhqAnswer(index, parseInt(value))
                            }
                            className="mr-1"
                          />
                          <span className="text-xs sm:text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex space-x-3">
                  <button
                    onClick={calculatePHQ9}
                    className="flex-1 bg-[#E32345] text-white py-2 px-4 rounded-md hover:bg-[#C71C39] transition-colors"
                  >
                    Evaluasi Kesehatan Mental
                  </button>
                  <button
                    onClick={resetPHQ9}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {phqScore !== null && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      Hasil PHQ-9
                    </h4>
                    <p className="text-lg font-semibold mb-2 text-black">
                      Skor Anda:{" "}
                      <span className="text-[#E32345]">{phqScore}/27</span>
                    </p>
                    <p className="text-md mb-2 text-black">
                      Interpretasi:{" "}
                      <span className="font-medium">{phqCategory}</span>
                    </p>
                    <p className="text-md mb-2 text-black">
                      Rekomendasi:{" "}
                      <span className="italic">{phqRecommendation}</span>
                    </p>

                    {phqScore >= 10 && (
                      <div className="mt-4 text-center">
                        <button className="bg-[#E32345] text-white py-2 px-6 rounded-md hover:bg-[#C71C39] transition-colors">
                          Konsultasi Dokter Sekarang
                        </button>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Hasil ini tidak menggantikan diagnosa profesional
                        kesehatan mental. Jika Anda mengalami pikiran untuk
                        menyakiti diri sendiri atau bunuh diri, segera hubungi
                        layanan darurat atau hotline krisis kesehatan mental.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
