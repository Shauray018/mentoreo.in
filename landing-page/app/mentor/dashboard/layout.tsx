import type { ReactNode } from "react";
import MentorNavbar from "@/app/components/MentorNavbar";

export default function MentorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {children}
    </div>
  );
}
