"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/AuthContext";

// Program data mock - in a real app this would come from an API or database
const programsData = {
  "fitness-basic": {
    id: "fitness-basic",
    name: "Dasar Kebugaran",
    category: "Kebugaran",
    duration: "8 minggu",
    description:
      "Bangun fondasi untuk gaya hidup yang lebih sehat dengan program kebugaran dasar kami.",
    color: "blue",
    tasks: [
      {
        id: 1,
        title: "Evaluasi Kebugaran Awal",
        description:
          "Lakukan tes kebugaran dasar untuk menentukan titik awal Anda.",
        dueDate: "Minggu 1, Hari 1",
        instructions:
          "Ikuti panduan evaluasi kebugaran yang disediakan dan catat hasil Anda.",
        estimatedTime: "30 menit",
      },
      {
        id: 2,
        title: "Latihan Kardio Ringan",
        description:
          "Lakukan latihan kardio ringan untuk meningkatkan daya tahan jantung Anda.",
        dueDate: "Minggu 1, Hari 2-5",
        instructions:
          "Jalan cepat atau jogging selama 15-20 menit dengan intensitas ringan.",
        estimatedTime: "20 menit",
      },
      {
        id: 3,
        title: "Latihan Kekuatan Dasar",
        description: "Mulai membangun kekuatan otot dengan latihan sederhana.",
        dueDate: "Minggu 1, Hari 3 & 6",
        instructions:
          "Lakukan 2 set dari 10 repetisi squat, push-up, dan plank selama 20 detik.",
        estimatedTime: "25 menit",
      },
      {
        id: 4,
        title: "Peregangan Rutin",
        description:
          "Lakukan rutinitas peregangan untuk meningkatkan fleksibilitas.",
        dueDate: "Minggu 1, Setiap Hari",
        instructions: "Ikuti panduan peregangan seluruh tubuh selama 10 menit.",
        estimatedTime: "10 menit",
      },
      {
        id: 5,
        title: "Refleksi Mingguan",
        description:
          "Evaluasi kemajuan Anda dan atur tujuan untuk minggu berikutnya.",
        dueDate: "Minggu 1, Hari 7",
        instructions:
          "Isi formulir refleksi mingguan dan catat bagaimana perasaan Anda.",
        estimatedTime: "15 menit",
      },
      {
        id: 6,
        title: "Peningkatan Latihan Kardio",
        description: "Tingkatkan intensitas latihan kardio Anda.",
        dueDate: "Minggu 2, Hari 2-5",
        instructions:
          "Jalan cepat atau jogging selama 25 menit dengan intensitas sedang.",
        estimatedTime: "25 menit",
      },
      {
        id: 7,
        title: "Menambah Latihan Kekuatan",
        description: "Tambahkan latihan baru dan tingkatkan repetisi.",
        dueDate: "Minggu 2, Hari 3 & 6",
        instructions:
          "Lakukan 3 set dari 12 repetisi squat, push-up, lunges, dan plank selama 30 detik.",
        estimatedTime: "30 menit",
      },
      {
        id: 8,
        title: "Latihan Keseimbangan",
        description:
          "Fokus pada latihan keseimbangan untuk meningkatkan stabilitas.",
        dueDate: "Minggu 2, Hari 4",
        instructions:
          "Lakukan latihan keseimbangan single-leg stand, heel-to-toe walk, dan yoga pose.",
        estimatedTime: "15 menit",
      },
    ],
  },
  "nutrition-balanced": {
    id: "nutrition-balanced",
    name: "Nutrisi Seimbang",
    category: "Nutrisi",
    duration: "12 minggu",
    description:
      "Pelajari cara membuat makanan bergizi seimbang yang mendukung tujuan kesehatan Anda.",
    color: "green",
    tasks: [
      {
        id: 1,
        title: "Evaluasi Kebiasaan Makan",
        description: "Lacak dan evaluasi kebiasaan makan Anda saat ini.",
        dueDate: "Minggu 1, Hari 1-3",
        instructions:
          "Catat semua yang Anda makan dan minum selama 3 hari berturut-turut.",
        estimatedTime: "15 menit per hari",
      },
      {
        id: 2,
        title: "Penyusunan Rencana Makan",
        description: "Buat rencana makan berdasarkan kebutuhan nutrisi Anda.",
        dueDate: "Minggu 1, Hari 4",
        instructions:
          "Gunakan template yang disediakan untuk merencanakan menu seminggu.",
        estimatedTime: "40 menit",
      },
      {
        id: 3,
        title: "Belanja Bahan Sehat",
        description: "Belanja bahan makanan sesuai dengan rencana makan Anda.",
        dueDate: "Minggu 1, Hari 5",
        instructions:
          "Gunakan daftar belanja yang telah dibuat dan fokus pada makanan segar.",
        estimatedTime: "60 menit",
      },
      {
        id: 4,
        title: "Persiapan Makanan Mingguan",
        description: "Lakukan persiapan makanan untuk minggu tersebut.",
        dueDate: "Minggu 1, Hari 6",
        instructions:
          "Siapkan dan simpan makanan dalam porsi yang tepat untuk beberapa hari ke depan.",
        estimatedTime: "90 menit",
      },
      {
        id: 5,
        title: "Evaluasi dan Penyesuaian",
        description:
          "Evaluasi rencana makan minggu pertama dan lakukan penyesuaian.",
        dueDate: "Minggu 1, Hari 7",
        instructions: "Catat apa yang berhasil dan apa yang perlu disesuaikan.",
        estimatedTime: "20 menit",
      },
      {
        id: 6,
        title: "Belajar Membaca Label Nutrisi",
        description:
          "Pelajari cara membaca dan memahami label informasi nutrisi.",
        dueDate: "Minggu 2, Hari 2",
        instructions:
          "Tonton video tutorial dan latih dengan makanan kemasan di rumah Anda.",
        estimatedTime: "30 menit",
      },
    ],
  },
  "mental-mindfulness": {
    id: "mental-mindfulness",
    name: "Perjalanan Mindfulness",
    category: "Kesehatan Mental",
    duration: "6 minggu",
    description:
      "Kembangkan praktik mindfulness untuk mengurangi stres dan meningkatkan kesejahteraan mental.",
    color: "purple",
    tasks: [
      {
        id: 1,
        title: "Pengenalan Mindfulness",
        description: "Memahami dasar-dasar mindfulness dan manfaatnya.",
        dueDate: "Minggu 1, Hari 1",
        instructions:
          "Baca materi pengantar dan lakukan latihan pernapasan selama 5 menit.",
        estimatedTime: "20 menit",
      },
      {
        id: 2,
        title: "Latihan Pernapasan Sadar",
        description: "Fokus pada pernapasan untuk mengembangkan kesadaran.",
        dueDate: "Minggu 1, Hari 2-7",
        instructions:
          "Lakukan latihan pernapasan sadar selama 10 menit setiap hari.",
        estimatedTime: "10 menit per hari",
      },
      {
        id: 3,
        title: "Body Scan Meditation",
        description:
          "Belajar melakukan body scan untuk meningkatkan kesadaran tubuh.",
        dueDate: "Minggu 2, Hari 1-3",
        instructions: "Ikuti audio panduan meditasi body scan selama 15 menit.",
        estimatedTime: "15 menit per hari",
      },
      {
        id: 4,
        title: "Jurnal Rasa Syukur",
        description: "Kembangkan kebiasaan mencatat hal-hal yang disyukuri.",
        dueDate: "Minggu 2, Hari 4-7",
        instructions:
          "Tulis 3 hal yang Anda syukuri setiap hari sebelum tidur.",
        estimatedTime: "5 menit per hari",
      },
      {
        id: 5,
        title: "Mindful Eating",
        description: "Praktikkan makan dengan kesadaran penuh.",
        dueDate: "Minggu 3, Hari 1-3",
        instructions:
          "Pilih satu makanan sehari untuk dimakan dengan kesadaran penuh tanpa gangguan.",
        estimatedTime: "15 menit per hari",
      },
    ],
  },
  "fitness-advanced": {
    id: "fitness-advanced",
    name: "Kebugaran Lanjutan",
    category: "Kebugaran",
    duration: "12 minggu",
    description:
      "Tingkatkan kebugaran Anda ke level berikutnya dengan program intensif lanjutan kami.",
    color: "blue",
    tasks: [
      {
        id: 1,
        title: "Evaluasi Kebugaran Mendalam",
        description:
          "Lakukan penilaian kebugaran komprehensif untuk menentukan area fokus.",
        dueDate: "Minggu 1, Hari 1",
        instructions:
          "Ikuti rangkaian tes kebugaran lengkap dan catat hasil baseline Anda.",
        estimatedTime: "45 menit",
      },
      {
        id: 2,
        title: "HIIT Session 1",
        description:
          "Latihan interval intensitas tinggi untuk membakar kalori dan membangun daya tahan.",
        dueDate: "Minggu 1, Hari 2",
        instructions:
          "Lakukan 8 putaran latihan 30 detik intens dan 30 detik istirahat.",
        estimatedTime: "30 menit",
      },
    ],
  },
  "weight-management": {
    id: "weight-management",
    name: "Manajemen Berat Badan",
    category: "Nutrisi",
    duration: "16 minggu",
    description:
      "Capai dan pertahankan berat badan sehat melalui nutrisi seimbang dan olahraga.",
    color: "green",
    tasks: [
      {
        id: 1,
        title: "Pengukuran Awal dan Penetapan Tujuan",
        description:
          "Ukur berat, BMI, dan ukuran tubuh Anda; tetapkan tujuan yang realistis.",
        dueDate: "Minggu 1, Hari 1",
        instructions:
          "Gunakan alat ukur yang disediakan dan catat semua pengukuran.",
        estimatedTime: "30 menit",
      },
      {
        id: 2,
        title: "Perhitungan Kebutuhan Kalori",
        description:
          "Hitung kebutuhan kalori harian berdasarkan aktivitas dan tujuan Anda.",
        dueDate: "Minggu 1, Hari 2",
        instructions:
          "Gunakan kalkulator kalori online dan atur target kalori harian.",
        estimatedTime: "20 menit",
      },
    ],
  },
  "stress-reduction": {
    id: "stress-reduction",
    name: "Pengurangan Stres",
    category: "Kesehatan Mental",
    duration: "8 minggu",
    description:
      "Pelajari teknik efektif untuk mengelola stres dan meningkatkan kesejahteraan secara keseluruhan.",
    color: "purple",
    tasks: [
      {
        id: 1,
        title: "Penilaian Tingkat Stres",
        description:
          "Identifikasi tingkat stres dan pemicu stres dalam hidup Anda.",
        dueDate: "Minggu 1, Hari 1",
        instructions:
          "Lengkapi kuesioner penilaian stres dan refleksikan hasilnya.",
        estimatedTime: "25 menit",
      },
      {
        id: 2,
        title: "Teknik Pernapasan Dalam",
        description:
          "Pelajari dan praktikkan teknik pernapasan untuk menenangkan sistem saraf.",
        dueDate: "Minggu 1, Hari 2-7",
        instructions:
          "Lakukan latihan pernapasan 4-7-8 selama 5 menit, tiga kali sehari.",
        estimatedTime: "15 menit per hari",
      },
    ],
  },
};

export default function ProgramDetailPage() {
  const { programId } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, you would fetch user's program data from an API or database
    if (programId && typeof programId === "string") {
      const programData = programsData[programId as keyof typeof programsData];
      if (programData) {
        setProgram(programData);

        // Check if user is enrolled in this program
        const enrolledPrograms = JSON.parse(
          localStorage.getItem("enrolled_programs") || "[]"
        );
        const enrolledProgram = enrolledPrograms.find(
          (p: any) => p.id === programId
        );
        const enrolled = !!enrolledProgram;
        setIsEnrolled(enrolled && enrolledProgram?.status === "active");

        // In a real app, load the user's completion status from somewhere
        const savedCompletedTasks = localStorage.getItem(
          `${programId}_completed_tasks`
        );
        if (savedCompletedTasks) {
          setCompletedTasks(JSON.parse(savedCompletedTasks));
        }
      }
    }
    setLoading(false);
  }, [programId]);

  const toggleTaskCompletion = (taskId: number) => {
    // Only allow checking tasks if enrolled
    if (!isEnrolled) {
      alert("Anda harus terdaftar pada program ini untuk menyelesaikan tugas");
      return;
    }

    let updatedCompletedTasks;

    if (completedTasks.includes(taskId)) {
      // Remove from completed if already there
      updatedCompletedTasks = completedTasks.filter((id) => id !== taskId);
    } else {
      // Add to completed
      updatedCompletedTasks = [...completedTasks, taskId];
    }

    setCompletedTasks(updatedCompletedTasks);

    // Save to localStorage (in a real app, save to a database)
    if (programId && typeof programId === "string") {
      localStorage.setItem(
        `${programId}_completed_tasks`,
        JSON.stringify(updatedCompletedTasks)
      );

      // Update enrolled program's progress
      updateEnrolledProgramProgress(updatedCompletedTasks.length);
    }
  };

  const enrollInProgram = () => {
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = "/login";
      return;
    }

    if (!program) return;

    // Get current enrolled programs
    const enrolledPrograms = JSON.parse(
      localStorage.getItem("enrolled_programs") || "[]"
    );

    // Check if already enrolled
    if (enrolledPrograms.some((p: any) => p.id === program.id)) {
      alert("Anda sudah terdaftar pada program ini");
      return;
    }

    // Add to enrolled programs
    const enrollDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const newEnrolledProgram = {
      id: program.id,
      name: program.name,
      category: program.category,
      joinedDate: enrollDate,
      duration: program.duration,
      totalTasks: program.tasks.length,
      completedTasks: completedTasks.length,
      progress: Math.round(
        (completedTasks.length / program.tasks.length) * 100
      ),
      status: "active",
    };

    enrolledPrograms.push(newEnrolledProgram);
    localStorage.setItem("enrolled_programs", JSON.stringify(enrolledPrograms));
    setIsEnrolled(true);

    alert("Anda berhasil mendaftar pada program ini");
  };

  const endProgram = () => {
    if (!user || !isEnrolled || !program) return;

    if (
      window.confirm(
        "Apakah Anda yakin ingin mengakhiri program ini? Progress Anda akan tetap tersimpan di histori."
      )
    ) {
      // Get current enrolled programs
      const enrolledPrograms = JSON.parse(
        localStorage.getItem("enrolled_programs") || "[]"
      );

      // Update the program status to 'ended'
      const updatedPrograms = enrolledPrograms.map((p: any) => {
        if (p.id === program.id) {
          return {
            ...p,
            status: "ended",
            endedDate: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            completedTasks: completedTasks.length,
            progress: Math.round(
              (completedTasks.length / program.tasks.length) * 100
            ),
          };
        }
        return p;
      });

      localStorage.setItem(
        "enrolled_programs",
        JSON.stringify(updatedPrograms)
      );
      setIsEnrolled(false);

      alert("Program telah diakhiri dan dipindahkan ke histori Anda");
    }
  };

  const updateEnrolledProgramProgress = (completedCount: number) => {
    if (!program) return;

    // Get current enrolled programs
    const enrolledPrograms = JSON.parse(
      localStorage.getItem("enrolled_programs") || "[]"
    );

    // Update the program progress
    const updatedPrograms = enrolledPrograms.map((p: any) => {
      if (p.id === program.id) {
        return {
          ...p,
          completedTasks: completedCount,
          progress: Math.round((completedCount / program.tasks.length) * 100),
        };
      }
      return p;
    });

    localStorage.setItem("enrolled_programs", JSON.stringify(updatedPrograms));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Kebugaran":
        return "blue";
      case "Nutrisi":
        return "green";
      case "Kesehatan Mental":
        return "purple";
      default:
        return "gray";
    }
  };

  const getProgressPercentage = () => {
    if (!program?.tasks?.length) return 0;
    return Math.round((completedTasks.length / program.tasks.length) * 100);
  };

  // Add a new function to check if program is ended
  const isProgramEnded = () => {
    if (!programId) return false;

    // Check enrolled programs in localStorage
    const enrolledPrograms = JSON.parse(
      localStorage.getItem("enrolled_programs") || "[]"
    );
    const programInfo = enrolledPrograms.find((p: any) => p.id === programId);

    return programInfo?.status === "ended";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Program Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Maaf, program yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/wellness"
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
        >
          Kembali ke Program Kesehatan
        </Link>
      </div>
    );
  }

  const color = getCategoryColor(program.category);
  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row mb-8 items-start gap-6">
          {/* Program Info */}
          <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div
              className={`h-2 bg-${color}-500 rounded-t-lg -mt-6 -mx-6 mb-6`}
            ></div>

            <span
              className={`inline-block px-3 py-1 text-sm rounded-full mb-4 bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-200`}
            >
              {program.category}
            </span>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {program.name}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {program.description}
            </p>

            <div className="flex items-center mb-6">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-4">
                Durasi: {program.duration}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Progress Anda
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className={`bg-${color}-500 h-4 rounded-full`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {completedTasks.length} dari {program.tasks.length} tugas
                  selesai
                </span>
                <span>{progressPercentage}%</span>
              </div>
            </div>

            {/* Program action buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {isEnrolled ? (
                <>
                  <button
                    onClick={endProgram}
                    className="w-full px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Akhiri Program
                  </button>
                  <Link
                    href="/my-programs"
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
                  >
                    Lihat Semua Program Saya
                  </Link>
                </>
              ) : isProgramEnded() ? (
                <>
                  <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-center">
                    Program Telah Berakhir
                  </div>
                  <Link
                    href="/my-programs"
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
                  >
                    Lihat Semua Program Saya
                  </Link>
                </>
              ) : (
                <button
                  onClick={enrollInProgram}
                  className={`w-full px-4 py-2 bg-${color}-500 text-white rounded-md hover:bg-${color}-600 transition-colors`}
                >
                  Ikuti Program Ini
                </button>
              )}
            </div>

            <Link
              href="/wellness"
              className="text-primary dark:text-primary-light hover:underline flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Kembali ke daftar program
            </Link>
          </div>

          {/* Tasks List */}
          <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Tugas Program
            </h2>

            {!isEnrolled && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
                <p>
                  Anda belum terdaftar pada program ini. Ikuti program untuk
                  mulai melacak kemajuan Anda.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {program.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 transition-all ${
                    completedTasks.includes(task.id)
                      ? `border-${color}-300 bg-${color}-50 dark:border-${color}-800 dark:bg-${color}-900/30`
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 pt-1">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          completedTasks.includes(task.id)
                            ? `bg-${color}-500 border-${color}-500 text-white`
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {completedTasks.includes(task.id) && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold mb-1 ${
                          completedTasks.includes(task.id)
                            ? `text-${color}-700 dark:text-${color}-300`
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p
                        className={`mb-2 ${
                          completedTasks.includes(task.id)
                            ? "text-gray-600 dark:text-gray-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                          {task.dueDate}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          {task.estimatedTime}
                        </span>
                      </div>

                      {/* Task Instructions - Collapsible */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm text-gray-700 dark:text-gray-300">
                        <h4 className="font-medium mb-1">Instruksi:</h4>
                        <p>{task.instructions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Ringkasan Kemajuan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Anda telah menyelesaikan {completedTasks.length} dari{" "}
                {program.tasks.length} tugas ({progressPercentage}%).
              </p>

              {progressPercentage === 100 ? (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-md">
                  <p className="font-medium">
                    Selamat! Anda telah menyelesaikan semua tugas dalam program
                    ini.
                  </p>
                </div>
              ) : progressPercentage >= 50 ? (
                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-3 rounded-md">
                  <p className="font-medium">
                    Kerja bagus! Anda sudah di tengah jalan. Tetap semangat!
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 p-3 rounded-md">
                  <p className="font-medium">
                    Anda baru memulai perjalanan ini. Lanjutkan langkah demi
                    langkah!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
