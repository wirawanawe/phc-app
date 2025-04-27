"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WellnessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the health programs page
    router.push("/health-programs");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
