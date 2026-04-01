"use client"

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '../components/ui/button';
import { 
  AlertTriangle, 
  Ghost, 
  Ban, 
  SearchX,
  MessageCircle,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  EyeOff
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import Link from 'next/link';

const truthWall = [
  {
    title: "The 100% Placement Scam",
    quote: "They told us top companies visit for placements. Bro, the only companies that came were selling credit cards and insurance. I'm doing a BBA and they wanted me to do door-to-door sales. Talk to a senior before joining.",
    author: "Anonymous, Tier 3 City College",
    color: "bg-red-50/80 border-red-200"
  },
  {
    title: "Mac Labs? More like No Labs",
    quote: "The website showed Mac labs and high-end rendering machines. In reality, half the PCs don't even turn on and the software licenses expired in 2021. You literally have to buy your own heavy laptop to pass.",
    author: "Anonymous, Pvt Design Institute",
    color: "bg-orange-50/80 border-orange-200"
  },
  {
    title: "Google is the Real Professor",
    quote: "Professors here just read out of PPTs downloaded from the internet. I asked a doubt about a basic concept and the sir told me 'Google it, don't waste class time.' We pay 3 lakhs a year for this.",
    author: "Anonymous, State College",
    color: "bg-blue-50/80 border-blue-200"
  },
  {
    title: "Hostel Photos are Fake",
    quote: "Hostel brochure: 'Airy rooms with attached washrooms'. Reality: 4 people stuffed in a room meant for 2, walls have damp spots, and the Wi-Fi blocks everything including YouTube. Don't fall for the website photos.",
    author: "Anonymous, North Campus",
    color: "bg-purple-50/80 border-purple-200"
  },
  {
    title: "Guest Lectures are a Joke",
    quote: "The 'industry experts' they brag about are just alumni who couldn't find a job, coming back to talk about hustle. There's zero career guidance here. Everyone is just preparing for govt exams on their own.",
    author: "Anonymous, Tier 2 City",
    color: "bg-yellow-50/80 border-yellow-200"
  },
  {
    title: "Zero Practical Knowledge",
    quote: "They promised moot courts and real case studies. We haven't had a single practical session in 2 years. It's just rote learning from outdated books. If you want to actually practice law, find another college.",
    author: "Anonymous, Pvt Law College",
    color: "bg-green-50/80 border-green-200"
  }
];

export default function WhyMentoreo() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const reduceMotion = prefersReducedMotion || isMobile;
  const motionProps = (props: Record<string, any>) => (reduceMotion ? {} : props);
  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans text-[#1F2937] overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {reduceMotion ? (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF8000]/10 to-transparent blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-400/10 to-orange-300/10 blur-[100px]" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ scale: [1, 1.08, 1], x: [0, 40, 0], y: [0, 24, 0] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF8000]/10 to-transparent blur-[120px]"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], x: [0, -32, 0], y: [0, -32, 0] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-400/10 to-orange-300/10 blur-[100px]"
            />
          </>
        )}
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } })}
            className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold text-sm mb-8"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>The System is Rigged</span>
          </motion.div>
          
          <motion.h1 
            {...motionProps({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } })}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#1F2937] leading-[1.1] tracking-tight mb-8"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Why Mentoreo? <br />
            <span className="text-[#FF8000]">Because Marketing ≠ Reality.</span>
          </motion.h1>

          <motion.p 
            {...motionProps({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 } })}
            className="text-xl sm:text-2xl text-[#1F2937]/70 font-medium leading-relaxed max-w-3xl mx-auto"
          >
            Let’s be honest. You’re about to spend lakhs of rupees and 3-4 years of your life based on a glossy brochure and a virtual tour shot 8 years ago. We built this because we're tired of students getting tricked.
          </motion.p>
        </div>
      </section>

      {/* The Core Problems */}
      <section className="relative py-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } })}
            className="bg-white/70 rounded-[32px] p-8 border border-[#1F2937]/5 shadow-[0_8px_30px_rgba(31,41,55,0.04)] md:hover:-translate-y-1 md:transition-transform"
          >
            <div className="w-14 h-14 bg-orange-100 text-[#FF8000] rounded-2xl flex items-center justify-center mb-6">
              <EyeOff className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Don't Fall for the Ads</h3>
            <p className="text-[#1F2937]/70 leading-relaxed font-medium">
              Every college brochure promises "100% placements" and a dream campus. But what happens after you pay the fees? Bypass the marketing traps. Get on a call with someone already studying there, and ask them what the college is <span className="italic font-bold text-[#1F2937]/90">actually</span> like behind closed doors.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.1 } })}
            className="bg-white/75 rounded-[32px] p-8 border border-[#1F2937]/5 shadow-[0_8px_30px_rgba(31,41,55,0.04)] md:hover:-translate-y-1 md:transition-transform"
          >
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Ghost className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Skip the "Seen" Zone</h3>
            <p className="text-[#1F2937]/70 leading-relaxed font-medium">
              Trying to find honest advice on LinkedIn or Reddit? You'll send 50 messages just to get one vague reply. Mentoreo gives you a cheat code. For the price of a small meal, book a guaranteed 1-on-1 call with a senior. Ask all your silly questions with absolutely zero judgment.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.2 } })}
            className="bg-white/75 rounded-[32px] p-8 border border-[#1F2937]/5 shadow-[0_8px_30px_rgba(31,41,55,0.04)] md:hover:-translate-y-1 md:transition-transform"
          >
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Don't Guess Your Future</h3>
            <p className="text-[#1F2937]/70 leading-relaxed font-medium">
              You are about to invest lakhs of rupees and the best years of your life into a degree. Don't pick your college just because your neighbors said it's good. Get the inside truth first. A 10-minute chat today can save you from 4 years of daily regret.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Bottom Line ROI Banner */}
      <section className="relative py-12 z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="bg-[#1F2937] rounded-[40px] p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF8000] via-transparent to-transparent blur-xl" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              The Bottom Line
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 font-medium max-w-2xl mx-auto relative z-10 leading-relaxed">
              If spending the price of a small meal saves you from a <span className="text-red-400 font-bold">₹15 Lakh</span> mistake, that’s the best investment you’ll ever make for your future.
            </p>
          </div>
        </div>
      </section>

      {/* Wall of Truth Section */}
      <section className="relative py-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1F2937] mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            The Wall of Truth <span className="text-[#FF8000]">(Zero Filter)</span>
          </h2>
          <p className="text-xl text-[#1F2937]/70 font-medium max-w-3xl mx-auto">
            This is where marketing brochures go to die. We’ve collected these "Real Talk" snippets from seniors who finally stopped pretending everything is perfect. This is the level of honesty you get on a Mentoreo call.
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {truthWall.map((item, index) => (
            <motion.div
              key={index}
              {...motionProps({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: index * 0.1 } })}
              className={`break-inside-avoid p-8 rounded-[32px] border ${item.color} relative group md:hover:scale-[1.02] md:transition-transform md:duration-300`}
            >
              <MessageCircle className="absolute top-6 right-6 w-8 h-8 text-[#1F2937]/10 md:group-hover:text-[#1F2937]/20 md:transition-colors" />
              <h4 className="text-xl font-bold text-[#1F2937] mb-4 pr-10 leading-snug">
                "{item.title}"
              </h4>
              <p className="text-[#1F2937]/80 font-medium leading-relaxed mb-6 italic">
                {item.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center font-bold text-[#1F2937]/50">
                  👤
                </div>
                <div className="text-sm font-bold text-[#1F2937]/60">
                  — {item.author}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 text-center z-10">
        <motion.div
          {...motionProps({ initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true } })}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-extrabold text-[#1F2937] mb-8" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Ready to hear the truth?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/student/signup">
              <Button className="w-full sm:w-auto bg-[#FF8000] md:hover:bg-[#FF6A0F] text-white rounded-full px-10 py-6 text-lg font-bold shadow-xl md:hover:shadow-2xl md:hover:-translate-y-1 md:transition-all">
                Find a Mentor Now
              </Button>
            </Link>
            <Link href="/onboard">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-[#1F2937]/10 text-[#1F2937] md:hover:border-[#FF8000] md:hover:text-[#FF8000] bg-white rounded-full px-10 py-6 text-lg font-bold shadow-sm md:hover:shadow-md md:hover:-translate-y-1 md:transition-all">
                Become a Mentor
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
