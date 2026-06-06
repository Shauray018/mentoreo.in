"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = ["Students", "Mentors", "Blog", "About", "Contact"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* ── Haze Layer ── */}
      {/* 
        FIX: No translate-y transform here. The old -translate-y-10 caused
        the blurred layer to start BELOW the top of the screen, creating
        the grey ghost-blob visible in your second screenshot.
        Now it just fades in/out with opacity only.
      */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: 140 }}
      >
        {/* Blur layer — kept separate so it doesn't clip the gradient edge */}
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            // Mask the blur so it only applies near the top,
            // preventing a hard blurred edge mid-page
            WebkitMaskImage:
              "linear-gradient(180deg, black 0%, black 50%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, black 0%, black 50%, transparent 100%)",
          }}
        />
        {/* Gradient fade on top of the blur */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              rgba(229,230,248,0.96) 0%,
              rgba(231,232,249,0.88) 18%,
              rgba(235,236,251,0.68) 38%,
              rgba(239,240,252,0.38) 62%,
              rgba(245,246,255,0.10) 84%,
              rgba(255,255,255,0.00) 100%
            )`,
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <div className="relative flex h-16 items-center justify-between px-8">
        {/* Left — logo + nav */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            className={`font-bold transition-colors duration-500 ${
              scrolled ? "text-black" : "text-white"
            }`}
          >
            Arc
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled
                    ? "text-black/80 hover:text-black"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Download Tab */}
        <div
          className={`flex flex-col items-center justify-center rounded-b-xl px-6 py-3 transition-all duration-500 ${
            scrolled ? "bg-white/80 backdrop-blur-xl" : "bg-white"
          }`}
        >
          <span className="text-[9px] font-semibold tracking-[0.25em] text-orange-600">
            DOWNLOAD
          </span>
          <span className="text-sm font-bold text-orange-600">Arc</span>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden transition-colors duration-300 ${
            scrolled ? "text-black" : "text-white"
          }`}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className={`mx-4 mt-2 rounded-2xl border backdrop-blur-2xl md:hidden ${
            scrolled
              ? "border-black/10 bg-white/70"
              : "border-white/20 bg-black/20"
          }`}
        >
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className={`block px-5 py-4 text-sm ${
                scrolled ? "text-black" : "text-white"
              }`}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}