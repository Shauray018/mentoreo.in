import { Suspense } from "react";
import StudentSignup from "@/components/pages/StudentSignup";

export default function StudentSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F2FF] flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-[#9758FF]/20 border-t-[#9758FF] animate-spin" />
        </div>
      }
    >
      <StudentSignup />
    </Suspense>
  );
}
