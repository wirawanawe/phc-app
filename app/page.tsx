"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { getDictionary } from "./lib/dictionary";

// Simplified interface with only what's required
interface Dictionary {
  home: Record<string, any>;
  common: Record<string, any>;
}

export default function Home() {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary("id");
        setDictionary(dict as Dictionary);
      } catch (error) {
        console.error("Failed to load dictionary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary-subtle rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 w-12 h-12 bg-primary rounded-full animate-pulse"></div>
          </div>
          <div className="text-black font-medium">Memuat aplikasi...</div>
          <div className="text-black text-sm">Mohon tunggu sebentar</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="main-content">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}
