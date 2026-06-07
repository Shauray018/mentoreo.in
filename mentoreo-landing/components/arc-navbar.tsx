"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/icon.jpg";

const NAV_LINKS = [
  { label: "Privacy Policy", href: "/about" },
  { label: "Why Mentoreo?", href: "/why-mentoreo" },
  { label: "Support", href: "/account-deletion" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        scrolled ? "pt-0" : "px-4 pt-6"
      }`}
    >
      <div
        className={`mx-auto py-2 flex items-center justify-between overflow-hidden border-2 border-black backdrop-blur-md bg-white/50 pl-4 transition-[max-width,border-radius,box-shadow] duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          scrolled
            ? "max-w-full  rounded-none border-x-0 border-t-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            : "max-w-[1000px] rounded-2xl shadow-none"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex flex-row items-start justify-start gap-0.5 text-start"
          aria-label="Mentoreo home"
        >
          <Image
            src={logo}
            alt="Mentoreo Logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-[10px] shadow-sm transition-transform group-hover:scale-110"
          />
          <span className="text-2xl pt-1 pl-0.5 font-bold text-orange-400 ">
            entoreo
          </span>
        </Link>

        {/* Desktop links — slide in/out smoothly */}
        <div
          className={`hidden md:flex items-center gap-8 transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            scrolled
              ? "translate-x-0 opacity-100"
              : "translate-x-0 opacity-100"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-zinc-700 tracking-wide transition-opacity  hover:border hover:border-black rounded-2xl p-2"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://play.google.com/store/apps/details?id=com.mentoreo.mobile&hl=en-US&ah=Dw3YnZ7nrPv6SVWAxYihmP2oedc"
            className="flex items-center justify-center bg-orange-400 border-2 border-black rounded-xl px-8 my-1 py-2 text-white font-semibold text-sm transition-all hover:bg-orange-500 active:scale-[0.97] mr-2"
          >
            Try
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-3"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-[1.5px] bg-black rounded transition-transform duration-300 ${
              menuOpen ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-black rounded transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-black rounded transition-transform duration-300 ${
              menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu — smooth slide down */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#0a0a0f] border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/70 text-[15px] font-medium hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://start.opalapp.com/2026-short"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Try for free
          </a>
        </div>
      </div>
    </nav>
  );
}
