"use client";

import Link from "next/link";
import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#FF8000]/10 blur-[80px]" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#FF8000]/15 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6">
          <FuzzyText
            fontSize="clamp(4rem, 18vw, 12rem)"
            fontWeight={900}
            color="#FF8000"
            baseIntensity={0.15}
            hoverIntensity={0.45}
            fuzzRange={28}
            direction="horizontal"
            className="mx-auto"
          >
            404
          </FuzzyText>
        </div>

        <div className="mt-2">
          <FuzzyText
            fontSize="clamp(1.6rem, 5vw, 2.6rem)"
            fontWeight={800}
            color="#1F2937"
            baseIntensity={0.08}
            hoverIntensity={0.2}
            fuzzRange={18}
            direction="horizontal"
            className="mx-auto"
          >
            Page not found
          </FuzzyText>
        </div>
        <p className="mt-3 max-w-xl text-base sm:text-lg text-[#1F2937]/70">
          The page you’re looking for doesn’t exist or was moved. Let’s get you back to
          Mentoreo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[16px] bg-[#FF8000] px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#FF6A0F]"
          >
            Go to Home
          </Link>
          <Link
            href="/mentor-perks"
            className="inline-flex items-center justify-center rounded-[16px] border-2 border-[#FF8000]/20 px-8 py-4 text-base font-bold text-[#1F2937] transition-colors hover:border-[#FF8000] hover:text-[#FF8000]"
          >
            Explore Mentors
          </Link>
        </div>
      </div>
    </main>
  );
}
