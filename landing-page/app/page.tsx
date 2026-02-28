'use client'

import Link from 'next/link'

const mentors = [
  { name: 'Sarah Chen',    role: 'Ex-Google · Product',   initials: 'SC' },
  { name: 'Marcus Rivera', role: 'YC Alum · Founder',     initials: 'MR' },
  { name: 'Priya Nair',   role: 'Partner · VC',          initials: 'PN' },
]

const steps = [
  { num: '1', title: 'Create your profile', desc: 'Sign up with your student email. We verify you\'re a real student — no impostors.' },
  { num: '2', title: 'Browse mentors',       desc: 'Filter by domain, company, or skill. Every mentor has been vetted by our team.' },
  { num: '3', title: 'Book a session',       desc: 'Schedule a 1-on-1 call. Get feedback, career advice, or technical guidance.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4
                      bg-[#FFFBF5]/80 backdrop-blur-md border-b border-orange-100">
        <span className="font-serif text-2xl text-orange-500 tracking-tight">mentoreo</span>
        <Link
          href="/signup"
          className="bg-orange-500 hover:bg-orange-700 text-white text-sm font-semibold
                     px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105 shadow-md shadow-orange-200"
        >
          Sign Up Free →
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center
                          text-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Blobs */}
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full
                        bg-orange-400 opacity-20 blur-[90px] animate-pulse" />
        <div className="absolute -bottom-12 -left-20 w-[380px] h-[380px] rounded-full
                        bg-orange-300 opacity-20 blur-[80px] animate-pulse [animation-delay:2s]" />

        <span className="animate-fade-up inline-flex items-center gap-1.5 bg-orange-100 text-orange-700
                         text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-7">
          🎓 Students Only · Verified
        </span>

        <h1 className="animate-fade-up delay-100 font-serif text-5xl md:text-7xl leading-[1.05]
                       tracking-tight max-w-3xl mb-6 text-stone-900">
          Learn from those who've{' '}
          <em className="text-orange-500 not-italic">been there</em>
        </h1>

        <p className="animate-fade-up delay-200 text-stone-500 text-lg max-w-md leading-relaxed mb-10">
          Mentoreo connects verified students with industry mentors.
          Get real guidance, not generic advice.
        </p>

        <div className="animate-fade-up delay-300 flex gap-3 flex-wrap justify-center mb-20">
          <Link
            href="/signup"
            className="bg-orange-500 hover:bg-orange-700 text-white font-semibold text-base
                       px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5
                       shadow-lg shadow-orange-200 hover:shadow-orange-300"
          >
            Get Started — It's Free
          </Link>
          <a
            href="#how"
            className="border border-stone-200 hover:border-orange-400 hover:text-orange-500
                       text-stone-800 font-medium text-base px-8 py-3.5 rounded-full transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Stats */}
        <div className="animate-fade-up delay-400 flex gap-12 flex-wrap justify-center
                        border-t border-stone-100 pt-10">
          {[['500+', 'Active Mentors'], ['120+', 'Colleges'], ['4.9★', 'Avg. Rating']].map(([n, l]) => (
            <div key={l} className="text-center">
              <span className="block font-serif text-4xl text-orange-500">{n}</span>
              <span className="text-sm text-stone-400 font-medium">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500 mb-3">
          How it works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-14 text-stone-900">
          Three steps to your<br />first session
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-2xl p-7 border border-stone-100
                         hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100
                         transition-all duration-200"
            >
              <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-xl
                              flex items-center justify-center font-bold text-base mb-5">
                {s.num}
              </div>
              <h3 className="font-semibold text-base mb-2 text-stone-900">{s.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENTORS */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-orange-500 mb-3">
          Featured mentors
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-14 text-stone-900">
          Learn from the best
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {mentors.map((m) => (
            <div key={m.name}
                 className="bg-white rounded-2xl p-6 border border-stone-100 flex items-center gap-4
                            hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white
                              flex items-center justify-center font-bold text-sm shrink-0">
                {m.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-stone-900">{m.name}</p>
                <p className="text-xs text-stone-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mx-4 md:mx-12 mb-24 bg-orange-500 rounded-3xl px-8 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <h2 className="relative font-serif text-4xl md:text-5xl text-white tracking-tight mb-4">
          Ready to find your mentor?
        </h2>
        <p className="relative text-orange-100 text-lg mb-8">
          Join thousands of students already accelerating their careers.
        </p>
        <Link
          href="/signup"
          className="relative bg-white text-orange-700 font-bold px-9 py-3.5 rounded-full
                     hover:scale-105 hover:shadow-2xl transition-all duration-200 inline-block"
        >
          Sign Up Now →
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="text-center pb-10 text-stone-400 text-sm">
        © 2025 Mentoreo · Built for students, by students
      </footer>
    </div>
  )
}