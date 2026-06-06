"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/icon.jpg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? "nav-glass" : ""
  }`}
>
  <div
    className="
      max-w-[1000px]
      mx-auto
      rounded-full
      mt-10
      pl-4
      flex items-center justify-between
      overflow-hidden
      backdrop-blur-md
      border border-gray-400
      bg-black/[0.02]
    "
  >
    {/* <div className="flex items-center gap-4">
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
            </div> */}
        {/* Logo */}
        <a href="#" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})}} className="flex items-center">
          {/* <img
            src="https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/66353d6a3b7542a6cf2520d4_opal-logo.svg"
            alt="Opal"
            className="h-8 w-auto"
          /> */}
          <Image
                  src={logo}
                  alt="Mentoreo Logo"
                  width={20}
                  height={20}
                  className="h-10 w-10 sm:h-8 sm:w-8 rounded-[12px] shadow-sm group-hover:scale-105 transition-transform"
                />
                <span
                  className="text-3xl pl-[1px] sm:text-xl font-bold text-[#1F2937] leading-none"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  <span className="text-[#FF8000]">entoreo</span>
                </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 ">
          {[
            { label: "Our Story", href: "/about" },
            { label: "Use Cases", href: "/use-cases" },
            { label: "Pricing", href: "/pricing" },
            { label: "For Schools", href: "/for-schools" },
            { label: "Support", href: "/help" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-gray hover:text-white/100 transition-opacity tracking-wide"
            >
              {link.label}
            </a>
          ))}
          {/* CTA */}
          <a
            href="https://start.opalapp.com/2026-short"
            className=" bg-orange-500  h-full flex items-center text-2xl justify-center px-5 py-4 rounded-full border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="gradient-text text-[13px] text-white ">Try for free</span>
          </a>

        </div>

        
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block w-5 h-[1.5px] bg-white rounded" />
          <span className="block w-5 h-[1.5px] bg-white rounded" />
          <span className="block w-5 h-[1.5px] bg-white rounded" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {[
            { label: "Our Story", href: "/about" },
            { label: "Use Cases", href: "/use-cases" },
            { label: "Pricing", href: "/pricing" },
            { label: "For Schools", href: "/for-schools" },
            { label: "Support", href: "/help" },
          ].map((link) => (
            <a key={link.label} href={link.href} className="text-white/70 text-[15px] font-medium">
              {link.label}
            </a>
          ))}
          <a
            href="https://start.opalapp.com/2026-short"
            className=" inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/10 bg-white/5"
          >
            <span className="gradient-text text-[14px] font-semibold">Try for free</span>
          </a>
        </div>
      )}
    </nav>
  );
}
