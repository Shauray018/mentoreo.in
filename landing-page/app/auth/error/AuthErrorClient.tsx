"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ERROR_COPY: Record<string, { title: string; body: string }> = {
  CredentialsSignin: {
    title: "That didn't work",
    body: "We couldn't sign you in with those details. Double‑check your email and password, or try Google sign‑in.",
  },
  OAuthAccountNotLinked: {
    title: "Use the same sign‑in method",
    body: "This email is linked to a different provider. Please use the original sign‑in method for this account.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You don't have permission to access this resource.",
  },
  Configuration: {
    title: "Temporary sign‑in issue",
    body: "We're having trouble connecting to the sign‑in service. Please try again in a moment.",
  },
  default: {
    title: "Sign‑in problem",
    body: "Something went wrong while signing you in. Please try again.",
  },
};

export default function AuthErrorClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error") ?? "default";
  const copy = ERROR_COPY[code] ?? ERROR_COPY.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F2FF] via-[#EFEAFF] to-[#E3DCFF] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-[#F3E8FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">{copy.title}</h1>
        <p className="text-sm text-[#6B7280] mb-6">{copy.body}</p>
        <div className="grid gap-3">
          <Link
            href="/student/login"
            className="w-full bg-[#9758FF] hover:bg-[#8A4FFF] text-white font-semibold py-3 rounded-xl transition-all"
          >
            Go to Student Login
          </Link>
          <Link
            href="/mentor/login"
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-xl transition-all"
          >
            Go to Mentor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
