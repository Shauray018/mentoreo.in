"use client"
import { useEffect, useRef } from "react"

const words = [
  "Stop",
  "gambling",
  "with",
  "your",
  "next",
  "4",
  "years.",
  "Get",
  "the",
  "unfiltered",
  "truth",
  "about",
  "your",
  "dream",
  "college",
  "from",
  "a",
  "verified",
  "senior",
  "in",
  "a",
  "quick",
  "chat.",
]

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null)
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      const windowHeight = window.innerHeight
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollableDistance = Math.max(
        1,
        sectionRef.current.offsetHeight - windowHeight
      )
      const scrollProgress = Math.max(
        0,
        Math.min(1, -rect.top / scrollableDistance)
      )
      const wordIndex = Math.floor(scrollProgress * (words.length - 1))

      wordsRef.current.forEach((el, i) => {
        if (!el) return
        if (i <= wordIndex) {
          el.style.backgroundImage =
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 100%)"
        } else {
          el.style.backgroundImage =
            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.12) 100%)"
        }
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-[220vh] bg-orange-400 sm:h-[240vh] md:h-[260vh]"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center px-5 py-16 sm:px-8 md:h-screen md:px-10 md:py-0 lg:px-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <h3 className="flex flex-wrap justify-center gap-x-2 gap-y-1.5 text-center font-sans text-[clamp(1.95rem,9.5vw,3.2rem)] leading-[1.14] font-semibold tracking-normal sm:gap-x-3 sm:text-[clamp(2.8rem,7.5vw,4rem)] md:gap-x-5 md:text-[56px] md:leading-[1.18] lg:gap-x-6">
            {words.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  wordsRef.current[i] = el
                }}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transition: "background-image 0.2s ease",
                }}
              >
                {word}
              </span>
            ))}
          </h3>
        </div>
      </div>
    </section>
  )
}
