"use client"
import { MentorSection } from "./MentorCarousel"

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-orange-400 px-4 py-14 sm:px-6 md:py-16 lg:h-screen lg:min-h-[760px] lg:px-8 lg:py-10"
    >
      <div className="mx-auto mb-8 max-w-[980px] text-center lg:mb-10">
        <h3
          style={{
            WebkitTextStroke: "2px #18181b",
            textShadow: "4px 4px 0 #18181b",
          }}
          className="mb-4 text-[clamp(40px,6vw,82px)] font-bold text-white"
        >
          Our Top Mentors
        </h3>
        <p className="mx-auto max-w-[860px] text-[clamp(16px,1.45vw,22px)] leading-snug text-white/65">
          Verified seniors ready to give you the real scoop on their college,
          placements, culture, and more.
        </p>
      </div>
      <MentorSection />
    </section>
  )
}
