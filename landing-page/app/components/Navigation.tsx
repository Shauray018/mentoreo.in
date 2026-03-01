"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import logo from "@/public/icon.jpg"; // move your image to /public

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const showBackButton = pathname !== "/";

  return (
    <nav className="bg-[#F5F1EB] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Back Button */}
          <div className="flex items-center gap-4">
            {/* {showBackButton && (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-[#FF7A1F] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )} */}

            <Link href="/" className="flex items-end gap-0.5">
              <Image
                src={logo}
                alt="Mentoreo Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span
                className="text-3xl font-bold text-gray-900 leading-none"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                <span className="text-[#FF7A1F]">entoreo</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-[#FF7A1F] transition-colors"
            >
              How It Works
            </a>

            <a
              href="#why-mentor"
              className="text-gray-700 hover:text-[#FF7A1F] transition-colors"
            >
              Why Mentor?
            </a>

            <Link href="/onboard">
              <Button className="bg-[#FF7A1F] cursor-pointer hover:bg-[#FF6A0F] text-white rounded-full px-8 py-5 font-semibold">
                Apply as Mentor
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            <a
              href="#how-it-works"
              className="block text-gray-700 hover:text-[#FF7A1F]"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>

            <a
              href="#why-mentor"
              className="block text-gray-700 hover:text-[#FF7A1F]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why Mentor?
            </a>

            <Link
              href="/onboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white rounded-full">
                Apply as Mentor
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}