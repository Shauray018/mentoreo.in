"use client";

import MentorDashboard from "@/components/pages/mentor/dashboard/MentorDashboard";
import { Suspense } from "react";

export default function MentorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Loading dashboard...
        </div>
      }
    >
      <MentorDashboard />
    </Suspense>
  );
}
