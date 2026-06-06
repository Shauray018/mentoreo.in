"use client";
import { useEffect, useRef } from "react";

const words = [
  "5 to 6 hours.", "That's", "the", "average", "time", "you'll", "spend",
  "on", "your", "phone", "today", "—", "often", "without", "realizing.",
  "It's", "time", "to", "fight", "back."
];

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const windowHeight = window.innerHeight;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = sectionRef.current.offsetHeight - windowHeight;
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      const wordIndex = Math.floor(scrollProgress * (words.length - 1));

      wordsRef.current.forEach((el, i) => {
        if (!el) return;
        if (i <= wordIndex) {
          el.style.backgroundImage = "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 100%)";
        } else {
          el.style.backgroundImage = "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)";
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[260vh] bg-orange-400">
      <div className="sticky top-0 flex h-screen items-center px-6 md:px-16">
        <div className="max-w-[900px] mx-auto">
          <h3 className="text-[56px] font-bold  flex flex-wrap gap-x-3 gap-y-1">
            {words.map((word, i) => (
              <span
                key={i}
                ref={el => { wordsRef.current[i] = el; }}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transition: "background-image 0.2s ease"
                }}
              >
                {word}
              </span>
            ))}
          </h3>
        </div>
      </div>
    </section>
  );
}
