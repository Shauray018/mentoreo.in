import { Suspense } from "react";
import OnboardClient from "./OnboardClient";

export default function OnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-[#FF7A1F]/20 border-t-[#FF7A1F] animate-spin" />
        </div>
      }
    >
      <OnboardClient />
    </Suspense>
  );
}
