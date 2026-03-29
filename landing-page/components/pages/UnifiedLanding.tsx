"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Navigation } from '@/app/components/Navigation';
import { CollegeShowcase } from '@/components/CollegeShowcase';
import ClickSpark from '../ClickSpark';
import { ChatBubbles } from '../wht';
import { MentorSection } from '../MentorCarousel';
import {
  ArrowRight,
  Clock,
  Shield,
  Search,
  UserRound,
  CalendarCheck,
  CreditCard,
  PhoneCall,
} from 'lucide-react';

// ── Main component ────────────────────────────────────────────────────────────
export default function UnifiedLanding() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const shouldReduceMotion = prefersReducedMotion || isMobile;

  const content = (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-14 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle gradient blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden lg:block">
          <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF8000]/12 to-orange-200/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[#FF8000]/8 to-yellow-200/8 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left pt-4 lg:pt-0">
              {/* Pricing Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex justify-center lg:justify-start mb-6"
              >
                <div className="bg-white/90 backdrop-blur-md border border-[#FF8000]/20 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 flex items-center gap-2.5 inline-flex shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8000] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-[#FF8000]"></span>
                  </span>
                  <span className="text-[#1F2937] text-sm sm:text-base" style={{ fontWeight: 700 }}>
                    Starting at <span className="text-[#FF8000]" style={{ fontWeight: 800 }}>₹5/min</span>
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] mb-5 leading-[1.08] tracking-tight text-[#1F2937]"
                style={{ fontWeight: 800 }}
              >
                Brochures Lie.{' '}
                <span
                  className="text-[#FF8000] block mt-1"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  Seniors Don't.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-base sm:text-lg md:text-xl text-[#1F2937]/65 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Stop gambling with your next 4 years. Get the unfiltered truth about your dream college from a verified senior in a quick chat.
              </motion.p>

              {/* CTA Group */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3"
              >
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#FF8000] hover:bg-[#E67300] text-white rounded-full px-7 py-3.5 text-base shadow-lg shadow-[#FF8000]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all h-auto inline-flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  <Link href="/student">
                    Find your Mentor <Search className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-[#FF8000]/30 text-[#FF8000] hover:bg-[#FFF3EA] rounded-full px-7 py-3.5 text-base shadow-sm transition-all h-auto inline-flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  <Link href="/onboard">Join as Mentor</Link>
                </Button>
              </motion.div>
            </div>

            {/* Right - Chat Bubbles + Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none lg:pl-8 hidden lg:block"
            >
              <ChatBubbles />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ───────────────────────────────────────────────── */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                icon: Shield,
                title: 'ID-Verified Seniors',
                desc: 'Every mentor submits a valid college ID before going live.',
                stat: '100%',
                statLabel: 'verified',
                accent: '#FF8000',
              },
              {
                icon: Clock,
                title: '5-Min Quick Sessions',
                desc: 'Get your answers fast — no long commitments needed.',
                stat: '₹5',
                statLabel: 'per min',
                accent: '#FF8000',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 sm:p-7 border border-[#1F2937]/[0.04] overflow-hidden group hover:border-[#FF8000]/20 transition-all hover:shadow-[0_4px_24px_rgba(255,128,0,0.08)]"
              >
                {/* Accent top line */}
                <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#FF8000]/30 to-transparent" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FFF5ED] to-[#FFE8D5] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <feature.icon className="w-[18px] h-[18px] text-[#FF8000]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[#1F2937] text-base sm:text-lg mb-1" style={{ fontWeight: 750 }}>
                        {feature.title}
                      </h3>
                      <p className="text-[#1F2937]/50 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  {/* Stat pill */}
                  <div className="shrink-0 text-right">
                    <div className="text-2xl sm:text-3xl text-[#FF8000]" style={{ fontWeight: 800, lineHeight: 1 }}>
                      {feature.stat}
                    </div>
                    <div className="text-[10px] text-[#FF8000]/60 mt-0.5 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                      {feature.statLabel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLEGE SHOWCASE ──────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 relative">
        {/* Subtle top/bottom gradient lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8000]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF8000]/10 to-transparent" />
        <CollegeShowcase />
      </section>

      {/* ── FIND YOUR MENTOR ──────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 relative px-4 sm:px-6 lg:px-8">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFF5ED]/50 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl text-[#1F2937] mb-3" style={{ fontWeight: 800 }}>
            Our Top Mentors
          </h2>
          <p className="text-[#1F2937]/60 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontWeight: 500 }}>
            Verified seniors ready to give you the real scoop on their college, placements, culture, and more.
          </p>
          <MentorSection />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 relative px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1F2937]/[0.04] to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            {/* Left copy */}
            <div className="text-center lg:text-left w-full lg:w-[280px] lg:shrink-0 lg:sticky lg:top-24">
              <h2 className="text-3xl sm:text-4xl text-[#1F2937] mb-3" style={{ fontWeight: 800 }}>
                How to get started?
              </h2>
              <p className="text-[#1F2937]/60 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed" style={{ fontWeight: 500 }}>
                4 simple steps to book a verified senior and get the truth.
              </p>
              <div className="mt-5 flex justify-center lg:justify-start">
                <Link href="/student">
                  <Button className="bg-[#FF8000] hover:bg-[#E67300] text-white rounded-full px-8 py-3.5 text-base shadow-lg shadow-[#FF8000]/20 hover:-translate-y-0.5 transition-all h-auto" style={{ fontWeight: 700 }}>
                    Try a Session
                  </Button>
                </Link>
              </div>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:flex-1 min-w-0">
              {[
                {
                  icon: UserRound,
                  step: '01',
                  title: 'Register',
                  desc: 'Create your profile and pick a mentor that fits your goals.',
                },
                {
                  icon: CalendarCheck,
                  step: '02',
                  title: 'Schedule',
                  desc: 'Choose a time slot that works and confirm the session.',
                },
                {
                  icon: CreditCard,
                  step: '03',
                  title: 'Pay',
                  desc: 'Pay securely with UPI or cards — just a single tap.',
                },
                {
                  icon: PhoneCall,
                  step: '04',
                  title: 'Connect',
                  desc: 'Hop on a quick call and get real, unfiltered advice.',
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 border border-[#1F2937]/[0.04] rounded-2xl p-5 sm:p-6 hover:border-[#FF8000]/15 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5ED] flex items-center justify-center group-hover:bg-[#FF8000]/10 transition-colors">
                      <step.icon className="w-5 h-5 text-[#FF8000]" strokeWidth={1.8} />
                    </div>
                    <span className="text-[#FF8000]/40 text-xs" style={{ fontWeight: 800 }}>{step.step}</span>
                  </div>
                  <h3 className="text-[#1F2937] text-base sm:text-lg mb-1.5" style={{ fontWeight: 750 }}>
                    {step.title}
                  </h3>
                  <p className="text-[#1F2937]/50 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MENTOR CTA ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 relative px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF8000] via-[#FF9533] to-[#FF6B8B]" />
            {/* Subtle noise/texture overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

            <div className="relative p-10 sm:p-14 md:p-16 text-center flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl text-white mb-4" style={{ fontWeight: 800, fontFamily: 'Fredoka, sans-serif' }}>
                  Your College ID is a Side-Hustle.
                </h2>
                <p className="text-base sm:text-lg text-white/85 max-w-lg mb-6 leading-relaxed" style={{ fontWeight: 500 }}>
                  Join the top 1% of Indian seniors. Help juniors, set your own hours, and get paid instantly via UPI.
                </p>
                <Link href="/onboard">
                  <Button className="bg-white hover:bg-[#FFF9F5] text-[#FF8000] rounded-full px-8 py-3.5 text-base shadow-lg hover:shadow-xl transition-all h-auto" style={{ fontWeight: 700 }}>
                    Apply as Mentor
                    <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2.5} />
                  </Button>
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1F2937]/[0.04] py-12 relative z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <span className="text-xl" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700 }}>
                  <span className="text-[#FF8000]">Mentoreo</span>
                </span>
              </Link>
              <p className="text-[#1F2937]/50 text-sm leading-relaxed max-w-[200px]">
                Peer-to-peer micro-consultancy for students, by students.
              </p>
            </div>
            {/* For Mentors */}
            <div>
              <h3 className="mb-3 text-xs uppercase tracking-wider text-[#1F2937]/40" style={{ fontWeight: 700 }}>For Mentors</h3>
              <ul className="space-y-2 text-sm text-[#1F2937]/60">
                <li><Link href="/onboard" className="hover:text-[#FF8000] transition-colors">Become a Mentor</Link></li>
                <li><Link href="/mentor/login" className="hover:text-[#FF8000] transition-colors">Mentor Login</Link></li>
              </ul>
            </div>
            {/* For Students */}
            <div>
              <h3 className="mb-3 text-xs uppercase tracking-wider text-[#1F2937]/40" style={{ fontWeight: 700 }}>For Students</h3>
              <ul className="space-y-2 text-sm text-[#1F2937]/60">
                <li><Link href="/student" className="hover:text-[#FF8000] transition-colors">Find Mentors</Link></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h3 className="mb-3 text-xs uppercase tracking-wider text-[#1F2937]/40" style={{ fontWeight: 700 }}>Company</h3>
              <ul className="space-y-2 text-sm text-[#1F2937]/60">
                <li><Link href="/" className="hover:text-[#FF8000] transition-colors">Our Story</Link></li>
                <li><a href="#" className="hover:text-[#FF8000] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#FF8000] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1F2937]/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1F2937]/40">
            <p>&copy; 2026 Mentoreo. Made with care for students, by students.</p>
            <p>Starting at <span className="text-[#FF8000]" style={{ fontWeight: 600 }}>₹5/min</span> · Chat-first · No video required</p>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );

  return (
    <div className="min-h-screen bg-[#FEFCFA] overflow-x-hidden font-sans text-[#1F2937]">
      <Navigation />
      {isMobile ? (
        content
      ) : (
        <ClickSpark
          sparkColor='#FF8000'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          {content}
        </ClickSpark>
      )}
    </div>
  );
}
