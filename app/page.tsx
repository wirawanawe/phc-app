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

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary("id");
      setDictionary(dict as Dictionary);
    };

    loadDictionary();
  }, []);

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
