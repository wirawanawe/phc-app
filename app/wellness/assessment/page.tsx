"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Pertanyaan penilaian kesehatan
const assessmentQuestions = [
  {
    id: "physical-activity",
    category: "Aktivitas Fisik",
    question:
      "Berapa hari dalam seminggu Anda melakukan aktivitas fisik sedang hingga berat selama minimal 30 menit?",
    options: [
      { value: 0, text: "Tidak ada" },
      { value: 1, text: "1-2 hari" },
      { value: 2, text: "3-4 hari" },
      { value: 3, text: "5+ hari" },
    ],
  },
  {
    id: "nutrition",
    category: "Nutrisi",
    question: "Berapa porsi buah dan sayuran yang Anda konsumsi setiap hari?",
    options: [
      { value: 0, text: "Tidak ada atau jarang" },
      { value: 1, text: "1-2 porsi" },
      { value: 2, text: "3-4 porsi" },
      { value: 3, text: "5+ porsi" },
    ],
  },
  {
    id: "sleep",
    category: "Tidur",
    question: "Rata-rata, berapa jam tidur yang Anda dapatkan setiap malam?",
    options: [
      { value: 0, text: "Kurang dari 5 jam" },
      { value: 1, text: "5-6 jam" },
      { value: 2, text: "7-8 jam" },
      { value: 3, text: "9+ jam" },
    ],
  },
  {
    id: "stress",
    category: "Kesehatan Mental",
    question: "Bagaimana Anda menilai tingkat stres Anda pada kebanyakan hari?",
    options: [
      { value: 0, text: "Sangat tinggi" },
      { value: 1, text: "Tinggi" },
      { value: 2, text: "Sedang" },
      { value: 3, text: "Rendah" },
    ],
  },
  {
    id: "water",
    category: "Nutrisi",
    question: "Berapa banyak air yang Anda minum setiap hari?",
    options: [
      { value: 0, text: "Kurang dari 2 gelas" },
      { value: 1, text: "2-4 gelas" },
      { value: 2, text: "5-7 gelas" },
      { value: 3, text: "8+ gelas" },
    ],
  },
  {
    id: "screen-time",
    category: "Gaya Hidup",
    question:
      "Berapa jam per hari yang Anda habiskan untuk waktu layar rekreasi (TV, ponsel, dll.)?",
    options: [
      { value: 3, text: "Kurang dari 1 jam" },
      { value: 2, text: "1-2 jam" },
      { value: 1, text: "3-4 jam" },
      { value: 0, text: "5+ jam" },
    ],
  },
  {
    id: "social",
    category: "Kesehatan Sosial",
    question:
      "Seberapa sering Anda terlibat dalam interaksi sosial yang bermakna?",
    options: [
      { value: 0, text: "Jarang atau tidak pernah" },
      { value: 1, text: "Beberapa kali sebulan" },
      { value: 2, text: "Mingguan" },
      { value: 3, text: "Harian" },
    ],
  },
];

// Rekomendasi program berdasarkan skor
const programRecommendations = {
  "physical-activity": {
    low: "fitness-basic",
    high: "fitness-advanced",
  },
  nutrition: {
    low: "nutrition-balanced",
    high: "weight-management",
  },
  "mental-health": {
    low: "mental-mindfulness",
    high: "stress-reduction",
  },
} as const;

// Mendefinisikan kunci kategori yang valid
type CategoryKey = "physical-activity" | "nutrition" | "mental-health";
type WellnessLevel = "low" | "high";
// Adding interface for categoryScores
interface CategoryScore {
  score: number;
  count: number;
}

// Adding interfaces for results and recommendedPrograms
interface CategoryResult {
  category: string;
  average: number;
  level: string;
  percentage: number;
}

interface AssessmentResults {
  categoryResults: CategoryResult[];
  recommendedPrograms: string[];
  overallScore: number;
}

export default function HealthAssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);

  const handleAnswer = (value: number) => {
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Menghitung hasil
      calculateResults();
    }
  };

  const calculateResults = () => {
    // Menghitung skor kategori
    const categoryScores: Record<string, CategoryScore> = {};

    assessmentQuestions.forEach((question) => {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { score: 0, count: 0 };
      }

      categoryScores[question.category].score += answers[question.id] || 0;
      categoryScores[question.category].count += 1;
    });

    // Menghitung rata-rata dan menentukan tingkat kesehatan
    const categoryResults = Object.entries(categoryScores).map(
      ([category, data]) => {
        const average = data.score / data.count;
        const level = average < 1.5 ? "low" : "high";

        return {
          category,
          average,
          level,
          percentage: Math.round((average / 3) * 100),
        };
      }
    );

    // Memetakan kategori ke jenis program
    let mappedCategories: Partial<Record<CategoryKey, WellnessLevel>> = {};
    categoryResults.forEach((result) => {
      // Create a safe mapping for category keys
      const categoryMapping: Record<string, CategoryKey | undefined> = {
        "Aktivitas Fisik": "physical-activity",
        Nutrisi: "nutrition",
        "Kesehatan Mental": "mental-health",
      };

      const categoryKey = categoryMapping[result.category];
      if (categoryKey && categoryKey in programRecommendations) {
        mappedCategories[categoryKey] = result.level as WellnessLevel;
      }
    });

    // Menghasilkan rekomendasi program
    const recommendedPrograms: string[] = [];

    // Safely access physical-activity recommendations
    if (mappedCategories["physical-activity"]) {
      const level = mappedCategories["physical-activity"];
      recommendedPrograms.push(
        programRecommendations["physical-activity"][level]
      );
    } else {
      recommendedPrograms.push("fitness-basic");
    }

    // Safely access nutrition recommendations
    if (mappedCategories["nutrition"]) {
      const level = mappedCategories["nutrition"];
      recommendedPrograms.push(programRecommendations["nutrition"][level]);
    }

    // Safely access mental-health recommendations
    if (mappedCategories["mental-health"]) {
      const level = mappedCategories["mental-health"];
      recommendedPrograms.push(programRecommendations["mental-health"][level]);
    } else {
      recommendedPrograms.push("mental-mindfulness");
    }

    setResults({
      categoryResults,
      recommendedPrograms: [...new Set(recommendedPrograms)],
      overallScore: Math.round(
        (Object.values(answers).reduce((sum, val) => sum + val, 0) /
          (assessmentQuestions.length * 3)) *
          100
      ),
    });

    setIsAssessmentCompleted(true);
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsAssessmentCompleted(false);
    setResults(null);
  };

  const currentQuestion = assessmentQuestions[currentQuestionIndex];

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Penilaian Kesehatan
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Ikuti penilaian singkat kami untuk mendapatkan rekomendasi
              kesehatan yang dipersonalisasi.
            </p>
          </div>

          <div className="flex items-center justify-center mb-10">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
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
                <li>
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
                    <Link
                      href="/wellness"
                      className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary md:ml-2"
                    >
                      Kesehatan
                    </Link>
                  </div>
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
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                      Penilaian
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {!isAssessmentCompleted ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pertanyaan {currentQuestionIndex + 1} dari{" "}
                      {assessmentQuestions.length}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {currentQuestion.category}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            assessmentQuestions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full text-left p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      className="h-12 w-12 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Penilaian Selesai!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Berdasarkan respons Anda, kami telah membuat profil
                    kesehatan yang dipersonalisasi.
                  </p>

                  <div className="mb-8">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg
                        className="w-40 h-40 transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="10"
                          strokeDasharray={`${
                            results
                              ? (2 * Math.PI * 45 * results.overallScore) / 100
                              : 0
                          } ${
                            results
                              ? 2 *
                                Math.PI *
                                45 *
                                (1 - results.overallScore / 100)
                              : 0
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">
                          {results?.overallScore}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
                      Skor Kesehatan Keseluruhan Anda
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hasil Kategori
                  </h3>

                  <div className="space-y-4">
                    {results?.categoryResults.map((result) => (
                      <div key={result.category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {result.category}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {result.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                          <div
                            className={`h-2.5 rounded-full ${
                              result.percentage >= 75
                                ? "bg-green-500"
                                : result.percentage >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Program yang Direkomendasikan
                  </h3>

                  <div className="space-y-4">
                    {results?.recommendedPrograms.map((programId) => (
                      <Link
                        key={programId}
                        href={`/wellness/${programId}`}
                        className="block bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {programId}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={restartAssessment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Mulai Ulang Penilaian
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
