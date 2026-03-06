"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import logo from "@/public/icon.jpg";

export default function MentorNavbar() {
  const { data: session, status } = useSession();

  const name = session?.user?.name ?? "Mentor";
  const email = session?.user?.email ?? "";

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/mentor/dashboard" className="flex items-end gap-1">
              <Image src={logo} alt="Mentoreo" width={34} height={34} className="rounded-lg" />
              <span
                className="text-2xl font-bold text-gray-900 leading-none"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                <span className="text-[#FF7A1F]">entoreo</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="h-4 w-px bg-gray-200" />
              <LayoutDashboard className="h-4 w-4" />
              <span>Mentor Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-9 w-28 rounded-xl bg-gray-100 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-gray-700">{name}</p>
                    {email ? <p className="text-[10px] text-gray-400">{email}</p> : null}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => signOut({ callbackUrl: "/mentor/login" })}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Link href="/mentor/login">
                <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
