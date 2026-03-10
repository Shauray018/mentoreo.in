"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, GraduationCap, LogOut, Menu, X } from "lucide-react";

import { Button } from "./ui/button";
import logo from "@/public/icon.jpg";

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const mentorName = session?.user?.name ?? "Mentor";
  const mentorAvatar = (session?.user as { image?: string } | null)?.image ?? null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  const navLinks = useMemo(
    () => [
      { name: "Why Mentoreo?", path: "/why-mentoreo" },
      { name: "Mentor Perks", path: "/mentor-perks" },
      { name: "Our Story", path: "/our-story" },
      { name: "FAQ's", path: "#faqs" },
    ],
    []
  );

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/mentor/login" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FFF9F5]/90 backdrop-blur-md border-b border-[#FF8000]/10 shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-end gap-1 group">
                <Image
                  src={logo}
                  alt="Mentoreo Logo"
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-[12px] shadow-sm group-hover:scale-105 transition-transform"
                />
                <span
                  className="text-3xl sm:text-4xl font-bold text-[#1F2937] leading-none"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  <span className="text-[#FF8000]">entoreo</span>
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {!isLoggedIn &&
                navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path.startsWith("#") ? `/${link.path}` : link.path}
                    className={`text-base font-semibold transition-colors ${
                      isActive(link.path)
                        ? "text-[#FF8000]"
                        : "text-[#1F2937]/80 hover:text-[#FF8000]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/mentor/dashboard"
                    className="flex items-center gap-3 text-[#1F2937] hover:text-[#FF8000] transition-colors px-4 py-2 rounded-full hover:bg-white/50"
                  >
                    <span className="w-9 h-9 rounded-full bg-[#FF8000]/10 border border-[#FF8000]/20 flex items-center justify-center text-sm shadow-sm">
                      {mentorAvatar ? (
                        <Image
                          src={mentorAvatar}
                          alt={mentorName}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        "👤"
                      )}
                    </span>
                    <span className="font-bold">{mentorName.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-full text-[#1F2937]/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setAuthModal("login")}
                    variant="outline"
                    className="border-2 border-[#1F2937]/10 text-[#1F2937] hover:border-[#FF8000] hover:text-[#FF8000] hover:bg-[#FF8000]/5 rounded-[16px] px-8 py-5 font-bold transition-all shadow-sm"
                  >
                    Log In
                  </Button>

                  <Button
                    onClick={() => setAuthModal("signup")}
                    className="bg-[#FF8000] hover:bg-[#FF6A0F] text-white border-2 border-[#FF8000] hover:border-[#FF6A0F] rounded-[16px] px-8 py-5 font-bold shadow-md hover:shadow-[0_8px_20px_rgba(255,128,0,0.25)] hover:-translate-y-0.5 transition-all"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            <button
              className="lg:hidden p-2 rounded-full text-[#1F2937] hover:bg-[#FF8000]/10 hover:text-[#FF8000] transition-colors"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden overflow-y-auto transition-all duration-300 ease-in-out bg-[#FFF9F5]/95 backdrop-blur-md border-b border-[#FF8000]/10 shadow-lg fixed w-full left-0 top-16 sm:top-20 z-40 ${
            mobileMenuOpen
              ? "max-h-[calc(100vh-64px)] opacity-100 border-b"
              : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <div className="px-6 py-6 flex flex-col gap-5 pb-12">
            {isLoggedIn ? (
              <>
                <Link
                  href="/mentor/dashboard"
                  className="text-lg font-bold text-[#1F2937] hover:text-[#FF8000] flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-8 h-8 rounded-full bg-[#FF8000]/10 flex items-center justify-center text-sm">
                    {mentorAvatar ? (
                      <Image
                        src={mentorAvatar}
                        alt={mentorName}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      "👤"
                    )}
                  </span>
                  Dashboard
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path.startsWith("#") ? `/${link.path}` : link.path}
                    className="text-lg font-bold text-[#1F2937]/80 hover:text-[#FF8000]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-lg font-bold text-red-500 hover:text-red-600 flex items-center gap-2 mt-2 pt-4 border-t border-[#1F2937]/5 w-fit"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.path.startsWith("#") ? `/${link.path}` : link.path}
                      className="text-[17px] font-bold text-[#1F2937]/80 hover:text-[#FF8000] py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="h-px w-full bg-[#1F2937]/10 my-2" />

                <div className="flex flex-col gap-4 pb-2">
                  <Button
                    onClick={() => {
                      setAuthModal("login");
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-[#1F2937]/20 text-[#1F2937] hover:border-[#FF8000] hover:text-[#FF8000] rounded-[16px] py-6 font-bold"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      setAuthModal("signup");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#FF8000] hover:bg-[#FF6A0F] text-white rounded-[16px] py-6 font-bold shadow-md"
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="h-20 sm:h-28 w-full shrink-0" />

      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModal(null)}
              className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="bg-white rounded-[24px] sm:rounded-[32px] w-full max-w-2xl p-6 sm:p-12 relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-10 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setAuthModal(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-[#1F2937]/40 hover:text-[#1F2937] hover:bg-[#1F2937]/5 transition-colors z-50 bg-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <h2
                className="text-2xl sm:text-4xl font-extrabold text-center text-[#1F2937] mb-6 sm:mb-10 mt-2 sm:mt-0"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                {authModal === "login" ? "Log In" : "Sign Up"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 items-stretch">
                <Link
                  href={authModal === "login" ? "/student/login" : "/student/signup"}
                  onClick={() => setAuthModal(null)}
                  className="group relative bg-[#F6F2FF] border-2 border-transparent hover:border-[#9758FF]/30 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 flex flex-row sm:flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full gap-4 sm:gap-8"
                >
                  <div className="w-16 h-16 sm:w-full sm:flex-1 flex items-center justify-center shrink-0">
                    <div className="w-16 h-16 sm:w-32 sm:h-32 flex items-center justify-center rounded-full bg-[#E3DCFF] group-hover:bg-[#CBB5FF]/50 transition-colors duration-300">
                      <GraduationCap
                        className="w-8 h-8 sm:w-14 sm:h-14 text-[#9758FF] group-hover:scale-110 transition-transform duration-300"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  <div className="w-full flex-1 sm:flex-none">
                    <div className="w-full bg-[#9758FF]/10 text-[#9758FF] group-hover:bg-[#9758FF] group-hover:text-white rounded-[12px] sm:rounded-[16px] py-2.5 sm:py-3.5 text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2">
                      {authModal === "login" ? "Student" : "As a Student"}
                      <span className="text-lg sm:text-xl leading-none">»</span>
                    </div>
                  </div>
                </Link>

                <Link
                  href={authModal === "login" ? "/mentor/login" : "/onboard"}
                  onClick={() => setAuthModal(null)}
                  className="group relative bg-[#FFF9F5] border-2 border-transparent hover:border-[#FF8000]/30 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 flex flex-row sm:flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full gap-4 sm:gap-8"
                >
                  <div className="w-16 h-16 sm:w-full sm:flex-1 flex items-center justify-center shrink-0">
                    <div className="w-16 h-16 sm:w-32 sm:h-32 flex items-center justify-center rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300">
                      <Briefcase
                        className="w-8 h-8 sm:w-14 sm:h-14 text-[#FF8000] group-hover:scale-110 transition-transform duration-300"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  <div className="w-full flex-1 sm:flex-none">
                    <div className="w-full bg-[#FF8000]/10 text-[#FF8000] group-hover:bg-[#FF8000] group-hover:text-white rounded-[12px] sm:rounded-[16px] py-2.5 sm:py-3.5 text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2">
                      {authModal === "login" ? "Mentor" : "As a Mentor"}
                      <span className="text-lg sm:text-xl leading-none">»</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
