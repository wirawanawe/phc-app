"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HealthInfoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/wellness");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Mengalihkan ke halaman Wellness...</p>
    </div>
  );
}
