"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Navigation } from '@/app/components/Navigation';
import { CollegeMarquee } from '@/components/CollegeMarquee';
import ClickSpark from '../ClickSpark';
import { ChatBubbles } from '../wht';
import GlareHover from '../GlareHover';
import { MentorSection } from '../MentorCarousel';
import Threads from '../Threads';
import {
  ArrowRight,
  MessageCircle,
  Clock,
  Shield,
  Search,
  CheckCircle2,
  Star,
  UserRound,
  CalendarCheck,
  CreditCard,
  PhoneCall,
} from 'lucide-react';


// ── Floating orbs (bg decoration) ────────────────────────────────────────────
function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF8000]/20 to-pink-300/20 blur-[100px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FF8000]/15 to-yellow-300/15 blur-[100px]"
      />
    </div>
  );
}

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
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* <div className="absolute inset-0 z-0 pointer-events-none">
          {!isMobile && (
            <Threads
              amplitude={0.55}
              distance={0.15}
            />
          )}
        </div> */}
        <div className="hidden lg:block">
          <Orbs />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full mb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left pt-8 lg:pt-0">
              {/* Pricing Highlight Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex justify-center lg:justify-start mb-8 sm:mb-10"
              >
                <div className="bg-white/90 backdrop-blur-md border border-[#FF8000]/30 shadow-[0_4px_20px_rgba(255,128,0,0.15)] rounded-full px-5 py-2.5 sm:px-6 sm:py-3 flex items-center gap-3 hover:scale-105 transition-transform cursor-default inline-flex">
                  <span className="relative flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8000] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-[#FF8000]"></span>
                  </span>
                  <span className="text-[#1F2937] font-bold text-sm sm:text-base tracking-wide uppercase">
                    Starting at just <span className="text-[#FF8000] font-extrabold text-base sm:text-lg">₹5/min 💸</span>
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="text-5xl sm:text-6xl md:text-7xl mb-6 leading-[1.1] tracking-tight text-[#1F2937]"
                style={{ fontWeight: 800 }}
              >
                Brochures Lie.<br className="hidden lg:block" />{' '}
                <span
                  className="text-[#FF8000] block sm:inline mt-2 sm:mt-0 lg:block lg:mt-2"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  Seniors Don't. 🎓
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg sm:text-xl md:text-2xl text-[#1F2937]/70 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed px-4 sm:px-0"
              >
                Stop gambling with your next 4 years or possibly your career 🤯. Get the unfiltered truth about your dream college from a verified senior in a quick chat/call ⚡
              </motion.p>
              
              {/* CTA Group */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 px-4 sm:px-0"
              >
                <Button
                  asChild
                  className="w-full sm:w-auto sm:min-w-[220px] bg-[#FF8000] hover:bg-[#E67300] text-white rounded-full px-7 sm:px-8 py-4 sm:py-5 text-base sm:text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all h-auto inline-flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  <Link href="/student">
                    Find your Mentor <Search className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[220px] bg-white/80 backdrop-blur-sm border-2 border-[#FF8000] text-[#FF8000] hover:bg-[#FFF3EA] rounded-full px-7 sm:px-8 py-4 sm:py-5 text-base sm:text-lg shadow-sm hover:shadow-md transition-all h-auto inline-flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  <Link href="/onboard">Join as Mentor ✨</Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none lg:pl-10 mt-12 lg:mt-0 hidden lg:block"
            >
              <ChatBubbles />
            </motion.div>
          </div>
        </div>

        {/* Grid of Values */}
        <div className="relative z-10 max-w-7xl mx-auto w-full mt-16 sm:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid sm:grid-cols-2 gap-6 sm:gap-8 text-left max-w-5xl mx-auto px-4 sm:px-0"
          >
            {[
              {
                icon: Shield,
                title: 'ID-Verified Seniors 🪪',
                desc: 'Every mentor submits a valid college ID.',
              },
              {
                icon: Clock,
                title: '5-Min Quick Sessions ⏱️',
                desc: 'Get your answers fast without long commitments.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm border border-[#FF8000]/10 rounded-[24px] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FFF9F5] rounded-[16px] flex items-center justify-center mb-5 border border-[#FF8000]/10 shadow-sm">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF8000]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[#1F2937] text-xl sm:text-2xl mb-3" style={{ fontWeight: 800 }}>
                  {feature.title}
                </h3>
                <p className="text-[#1F2937]/60 text-base sm:text-lg leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>  

      {/* ── COLLEGE MARQUEE ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 relative z-10 w-full overflow-hidden bg-white/40 border-y border-[#FF8000]/5 backdrop-blur-md">
        <CollegeMarquee />
      </section>

      {/* ── FIND YOUR MENTOR ────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Find your Mentor Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl text-[#1F2937] mb-4" style={{ fontWeight: 800 }}>
              Our Top Mentors
            </h2>
            <p className="text-[#1F2937]/70 text-lg sm:text-xl max-w-3xl mx-auto px-4 leading-relaxed font-semibold">
              To guide you through each step with their expertise and skills. We connect you with them to gain valuable insights before you lock in your dream college.
            </p>
          </motion.div>

          {/* Mentor Profiles Carousel */}
          <MentorSection />
        </div>
      </section>
{/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
<section className="py-20 sm:py-28 relative z-10">
  <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
      {/* Left copy */}
      <div className="text-center lg:text-left w-full lg:w-[300px] lg:shrink-0">
        <h2 className="text-4xl sm:text-5xl text-[#1F2937] mb-4" style={{ fontWeight: 800 }}>
          How to get started?
        </h2>
        <p className="text-[#1F2937]/70 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
          In just 4 simple steps you can book a verified senior and get the
          truth behind your dream college.
        </p>
        <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
          <Link href="/student">
            <Button className="bg-[#FF8000] hover:bg-[#E67300] text-white rounded-full px-10 py-6 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all h-auto" style={{ fontWeight: 700 }}>
              Take a Trial Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-2 gap-5 w-full lg:flex-1 min-w-0">
        {[
          {
            icon: UserRound,
            title: '1. Register/Login',
            desc: 'Create your profile and pick a mentor that fits your goals.',
          },
          {
            icon: CalendarCheck,
            title: '2. Schedule a call',
            desc: 'Choose a time slot that works and confirm the session.',
          },
          {
            icon: CreditCard,
            title: '3. Make a payment',
            desc: 'Pay securely with UPI or cards in a single tap.',
          },
          {
            icon: PhoneCall,
            title: '4. Connect to your mentor',
            desc: 'Hop on a quick call and get the real, unfiltered advice.',
          },
        ].map((step, idx) => (
          <div
            key={idx}
            className="bg-white/90 backdrop-blur-sm border border-[#FF8000]/10 rounded-[24px] p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#FF8000]/20 flex items-center justify-center mb-4">
              <step.icon className="w-6 h-6 text-[#FF8000]" strokeWidth={1.8} />
            </div>
            <h3 className="text-[#1F2937] text-lg sm:text-xl mb-2" style={{ fontWeight: 800 }}>
              {step.title}
            </h3>
            <p className="text-[#1F2937]/60 text-sm sm:text-base leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ── MENTOR CTA ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-32 relative z-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl">
            {/* Soft orange-to-pink gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF8000] via-[#FF9D42] to-[#FF6B8B] opacity-90 mix-blend-multiply" />
            
            {/* Inner content */}
            <div className="relative p-12 sm:p-16 md:p-20 text-center flex flex-col items-center">
              <h2 className="text-4xl sm:text-5xl text-white mb-6" style={{ fontWeight: 800, fontFamily: 'Fredoka, sans-serif' }}>
                Your College ID is a Side-Hustle.
              </h2>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-10 leading-relaxed font-medium">
                Join the top 1% of Indian seniors. Help juniors, set your own hours, and get paid instantly via UPI.
              </p>
              <Link href="/onboard">
                <Button className="bg-white hover:bg-[#FFF9F5] text-[#FF8000] rounded-full px-10 py-7 text-lg shadow-xl hover:scale-105 transition-all w-full sm:w-auto" style={{ fontWeight: 700 }}>
                  Apply as Mentor
                  <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2.5} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#FF8000]/10 py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-end gap-0.5 mb-4">
                <span className="text-2xl" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700 }}>
                  <span className="text-[#FF8000]">Mentoreo</span>
                </span>
              </Link>
              <p className="text-[#1F2937]/60 text-sm leading-relaxed">
                Peer-to-peer micro-consultancy connecting confused students with verified seniors.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm uppercase tracking-wider text-[#1F2937]" style={{ fontWeight: 700 }}>For Mentors</h3>
              <ul className="space-y-3 text-sm text-[#1F2937]/70">
                <li><Link href="/onboard" className="hover:text-[#FF8000] transition-colors">Become a Mentor</Link></li>
                <li><Link href="/mentor/login" className="hover:text-[#FF8000] transition-colors">Mentor Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm uppercase tracking-wider text-[#1F2937]" style={{ fontWeight: 700 }}>For Students</h3>
              <ul className="space-y-3 text-sm text-[#1F2937]/70">
                <li><Link href="/student" className="hover:text-[#FF8000] transition-colors">Find Mentors</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm uppercase tracking-wider text-[#1F2937]" style={{ fontWeight: 700 }}>Company</h3>
              <ul className="space-y-3 text-sm text-[#1F2937]/70">
                <li><Link href="/" className="hover:text-[#FF8000] transition-colors">Our Story</Link></li>
                <li><a href="#" className="hover:text-[#FF8000] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#FF8000] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#FF8000]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#1F2937]/50">
            <p>© 2026 Mentoreo. Made with 🧡 for students, by students.</p>
            <p>Starting at <span className="text-[#FF8000]" style={{ fontWeight: 600 }}>₹5/min</span> · Chat-first · No video required</p>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );

  return (
    <div className="min-h-screen bg-[#FFF9F5] overflow-x-hidden font-sans text-[#1F2937]">
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
