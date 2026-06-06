"use client";
import { useEffect, useRef, useState } from "react";

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="impact" className="bg-[#0a0a0f] py-24 px-6 md:px-12">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[clamp(26px,3.5vw,46px)] font-bold tracking-[-0.02em] text-white">
            Average time saved thanks to Opal
          </h3>
        </div>

        {/* Stats row */}
        <div className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { stat: "1h 23m", label: "saved daily" },
            { stat: "1 month", label: "saved each year" },
            { stat: "6 years", label: "of life reclaimed" },
          ].map((item, i) => (
            <div key={i} className="text-center" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="text-[clamp(40px,6vw,80px)] font-bold tracking-[-0.03em] gradient-text leading-none mb-2">
                {item.stat}
              </div>
              <div className="text-[clamp(16px,1.5vw,20px)] font-medium text-white/60">{item.label}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-[12px] mb-16">
          *Calculated on the basis of daily Screen Time before and after Opal for over N=300,000
        </p>

        {/* 3-stat bar */}
        <div className="gradient-border-card p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
            {[
              { pct: "94%", label: "Less distracted", desc: "Stay focused and minimize disruptions with proven, effective results." },
              { pct: "93%", label: "More productive", desc: "Achieve significantly more each day with enhanced efficiency." },
              { pct: "90%", label: "Improved mental health", desc: "Experience a substantial boost in mental well-being and overall life balance." },
            ].map((item, i) => (
              <div key={i} className={`text-center px-6 ${i < 2 ? "md:border-r border-white/6" : ""}`}>
                <div className="text-[clamp(48px,6vw,80px)] font-bold tracking-[-0.03em] gradient-text leading-none mb-3">
                  {item.pct}
                </div>
                <div className="text-[15px] font-semibold text-white mb-2">{item.label}</div>
                <p className="text-white/45 text-[13px] leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}