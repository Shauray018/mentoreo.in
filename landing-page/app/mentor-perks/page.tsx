"use client";

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Target, Trophy, Flame, Users, ArrowUpRight, CheckCircle2, TrendingUp, Zap, Crown, ChevronRight, ChevronDown, Banknote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Navigation } from '../components/Navigation';
import Link from 'next/link';

export default function MentorPerks() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] pt-24 pb-20 overflow-hidden relative">
      <Navigation />
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF8000]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          {...motionProps({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: "easeOut" } })}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#FF8000]/20 text-[#FF8000] font-bold text-sm mb-6 shadow-sm">
            <Zap className="w-4 h-4" /> Not just another gig
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1F2937] mb-6 leading-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Get paid to be the <span className="text-[#FF8000]">senior</span> you never had.
          </h1>
          <p className="text-lg sm:text-xl text-[#1F2937]/70 font-medium leading-relaxed px-4 sm:px-0">
            Mentoreo isn't just about giving advice. It's about building your brand, expanding your network, and stacking cash while helping juniors navigate college.
          </p>
        </motion.div>

        {/* Bento Grid: Standard Perks */}
        <motion.div 
          variants={reduceMotion ? undefined : (containerVariants as any)}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 md:mb-32"
        >
          {/* Large Card */}
          <motion.div variants={reduceMotion ? undefined : (itemVariants as any)} className="md:col-span-2 bg-white/80 border border-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-bl from-[#FF8000]/20 to-transparent rounded-full blur-2xl sm:blur-3xl -mr-10 -mt-10 sm:-mr-20 sm:-mt-20 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF8000]/10 text-[#FF8000] rounded-xl sm:rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Work on your own terms.</h3>
              <p className="text-[#1F2937]/70 text-base sm:text-lg leading-relaxed max-w-md mb-8">
                Got midterms? Turn off your availability. Free weekend? Open up 5 slots. You have 100% control over your schedule and pricing.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-bold text-[#1F2937]/80 shadow-sm border border-gray-100">Set your hours</span>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-bold text-[#1F2937]/80 shadow-sm border border-gray-100">Set your rates</span>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-bold text-[#1F2937]/80 shadow-sm border border-gray-100">1-on-1 calls</span>
              </div>
            </div>
          </motion.div>

          {/* Tall Card */}
          <motion.div variants={reduceMotion ? undefined : (itemVariants as any)} className="bg-gradient-to-b from-[#1F2937] to-gray-900 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden group flex flex-col justify-between text-white min-h-[300px] sm:min-h-[auto]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 text-white rounded-xl sm:rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Instant Resume Boost.</h3>
              <p className="text-white/70 text-sm sm:text-lg leading-relaxed">
                "Mentored 50+ students on Mentoreo" looks significantly better on a resume than joining another random college society.
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF8000] w-[75%] rounded-full relative">
                  <div className={`absolute top-0 right-0 bottom-0 w-4 bg-white/30 skew-x-12 ${reduceMotion ? "" : "animate-[shimmer_2s_infinite]"}`} />
                </div>
              </div>
              <p className="text-white/50 text-xs sm:text-sm font-bold mt-2 sm:mt-3 text-right">Top 5% of Mentors</p>
            </div>
          </motion.div>
        </motion.div>


        {/* CAMPUS BOOST SECTION - The Main Event */}
        <div className="relative">
          {/* Background decoration for this section */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF8000]/5 to-transparent -mx-[50vw] px-[50vw] pointer-events-none" />
          
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" } })}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#FF8000] text-white font-black text-xs sm:text-sm tracking-wider uppercase mb-6 shadow-lg shadow-[#FF8000]/30 transform -rotate-2">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4 fill-white" /> Feature Alert
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#1F2937] mb-4 sm:mb-6 leading-tight px-2 sm:px-0" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Introducing <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8000] to-red-500">Campus Boost</span>
            </h2>
          </motion.div>

          {/* NEW: Integrated "Simple Math" & Rules (Floating Cards Animation) */}
          <motion.div 
            {...motionProps({ initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } })}
            className="mb-16 sm:mb-24 relative z-10"
          >
            
            <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-0">
               
               {/* Card 1: The Play & Grind */}
               <motion.div 
                 animate={reduceMotion ? undefined : { y: [-6, 6, -6] }}
                 transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="bg-white/85 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-xl border border-white w-full lg:w-1/3 text-center relative z-10 flex flex-col h-full"
               >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center mb-5">
                     <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-[#1F2937] text-lg sm:text-xl mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>The Play</h4>
                  <p className="text-sm text-[#1F2937]/70 font-medium mb-6 flex-grow">Bring your batchmates on board. More mentors from your college = more active power.</p>
                  
                  <div className="mt-auto bg-gray-50/80 rounded-xl p-4 border border-gray-100/50 text-left">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> The Grind
                    </span>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Drop to #2, and everyone on your campus falls back to 75%. Rankings below that get the standard 70%.</p>
                  </div>
               </motion.div>
               
               {/* Divider 1 */}
               <div className="hidden lg:flex items-center justify-center w-8">
                 <ChevronRight className="w-8 h-8 text-[#1F2937]/20" />
               </div>
               <div className="lg:hidden flex items-center justify-center py-2">
                 <ChevronDown className="w-8 h-8 text-[#1F2937]/20" />
               </div>
               
               {/* Card 2: The Goal */}
               <motion.div 
                 animate={reduceMotion ? undefined : { y: [6, -6, 6] }}
                 transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                 className="bg-white/85 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-xl border border-white w-full lg:w-1/3 text-center relative z-10 flex flex-col h-full"
               >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 rounded-2xl mx-auto flex items-center justify-center mb-5 relative">
                     <Target className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF8000]" />
                     <div className={`absolute -top-1 -right-1 w-3 h-3 bg-[#FF8000] rounded-full border-2 border-white ${reduceMotion ? "" : "animate-pulse"}`} />
                  </div>
                  <h4 className="font-bold text-[#1F2937] text-lg sm:text-xl mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>The Goal</h4>
                  <p className="text-sm text-[#1F2937]/70 font-medium mb-6 flex-grow">Hit the #1 spot on the platform leaderboard by the last day of the week.</p>
                  
                  <div className="mt-auto bg-orange-50/50 rounded-xl p-4 border border-orange-100/50 text-left">
                    <span className="text-[10px] font-black text-[#FF8000] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Status
                    </span>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">Leaderboard standings update live based only on campus activity.</p>
                  </div>
               </motion.div>
               
               {/* Divider 2 */}
               <div className="hidden lg:flex items-center justify-center w-8">
                 <div className="text-4xl font-black text-[#1F2937]/20">=</div>
               </div>
               <div className="lg:hidden flex items-center justify-center py-2">
                 <div className="text-4xl font-black text-[#1F2937]/20">=</div>
               </div>

               {/* Card 3: The Reward */}
               <motion.div 
                 animate={reduceMotion ? undefined : { y: [-6, 6, -6] }}
                 transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="bg-gradient-to-br from-yellow-400 to-[#FF8000] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_40px_-15px_rgba(255,128,0,0.4)] border border-yellow-300 w-full lg:w-1/3 text-center relative z-10 transform hover:scale-[1.02] transition-transform flex flex-col h-full"
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-[24px] sm:rounded-[32px]" />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-5 relative z-10">
                     <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-lg sm:text-xl mb-3 relative z-10" style={{ fontFamily: 'Fredoka, sans-serif' }}>The Reward</h4>
                  <p className="text-sm text-white/90 font-medium mb-6 flex-grow relative z-10">If your campus is #1, <strong className="text-white">every mentor</strong> from your college wins big.</p>
                  
                  <div className="mt-auto bg-white/10 rounded-xl p-4 border border-white/20 text-left relative z-10">
                    <span className="text-[10px] font-black text-yellow-200 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> Payout Unlocked
                    </span>
                    <p className="text-sm text-white font-bold leading-relaxed">80% payout for the entire next week.</p>
                  </div>
               </motion.div>
            </div>
          </motion.div>

          {/* Centered Live Standings */}
          <motion.div 
            {...motionProps({ initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true } })}
            className="max-w-4xl mx-auto relative z-10 px-4 sm:px-0"
          >
            {/* Decorative elements behind leaderboard */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#FF8000]/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border-2 border-[#1F2937]/5 overflow-hidden relative z-10">
              
              {/* Board Header */}
              <div className="bg-[#1F2937] p-5 sm:p-8 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <h3 className="text-2xl sm:text-3xl font-bold relative z-10 mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>Live Standings</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${reduceMotion ? "" : "animate-ping"}`}></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <p className="text-green-400 text-xs sm:text-sm font-bold tracking-widest relative z-10 uppercase">Live Mentor Count</p>
                </div>
              </div>

              {/* Board List */}
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-5 bg-gradient-to-b from-white to-[#FFF9F5]/50">
                
                {/* Rank 1 */}
                <div className="p-4 sm:p-5 bg-yellow-50 border border-yellow-200 rounded-[16px] sm:rounded-2xl shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-transform">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />
                  <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10 pl-2 sm:pl-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center font-black text-yellow-600 text-lg sm:text-xl shadow-inner border border-yellow-200">1</div>
                      <div>
                        <p className="font-bold text-[#1F2937] text-lg sm:text-xl">IIT Bombay</p>
                        <p className="text-[10px] sm:text-xs font-bold text-yellow-600 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                          <Crown className="w-3 h-3" /> 80% Payout
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#1F2937] text-2xl sm:text-3xl">342</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Mentors</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-yellow-200/50 rounded-full h-2 sm:h-2.5 mt-2 relative z-10">
                     <div className="bg-yellow-400 h-full rounded-full w-[95%] relative overflow-hidden">
                        <div className={`absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full ${reduceMotion ? "" : "animate-[shimmer_2s_infinite]"}`} />
                     </div>
                  </div>
                </div>

                {/* Rank 2 */}
                <div className="p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-[16px] sm:rounded-2xl relative hover:bg-gray-100 transition-colors">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-300" />
                  <div className="flex items-center justify-between mb-3 sm:mb-4 pl-2 sm:pl-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center font-black text-gray-600 text-lg sm:text-xl shadow-inner border border-gray-300">2</div>
                      <div>
                        <p className="font-bold text-[#1F2937] text-base sm:text-lg">BITS Pilani</p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">🥈 75% Tier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1F2937] text-xl sm:text-2xl">315</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Mentors</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                     <div className="bg-gray-400 h-full rounded-full w-[85%]" />
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="p-4 sm:p-5 bg-white border border-orange-100 rounded-[16px] sm:rounded-2xl relative hover:bg-orange-50/50 transition-colors">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF8000]/30" />
                  <div className="flex items-center justify-between mb-3 sm:mb-4 pl-2 sm:pl-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 flex items-center justify-center font-black text-[#FF8000] text-lg sm:text-xl shadow-inner border border-orange-100">3</div>
                      <div>
                        <p className="font-bold text-[#1F2937] text-base sm:text-lg">NIT Trichy</p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5">🥉 70% Tier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1F2937] text-xl sm:text-2xl">280</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Mentors</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2">
                     <div className="bg-[#FF8000]/40 h-full rounded-full w-[75%]" />
                  </div>
                </div>

                {/* Rank 4 */}
                <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-[16px] sm:rounded-2xl opacity-75">
                  <div className="flex items-center justify-between pl-2 sm:pl-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-lg sm:text-xl border border-gray-100">4</div>
                      <div>
                        <p className="font-bold text-[#1F2937] text-base sm:text-lg">SRCC Delhi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1F2937] text-lg sm:text-xl">210</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Mentors</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Shifted Keep It Simple Text */}
            <div className="mt-8 sm:mt-10 text-center max-w-2xl mx-auto px-4 sm:px-0 relative z-10">
               <p className="text-base sm:text-lg text-[#1F2937]/80 font-bold leading-relaxed bg-white/70 py-3 px-6 rounded-2xl border border-orange-100 shadow-sm inline-block">
                  Let's keep it simple: Help us grow, and we'll boost your paycheck.<br className="hidden sm:block" /> Every single week. No t&c, just more earnings.
               </p>
            </div>
            
            {/* Floating notification element */}
            <motion.div 
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 sm:-right-8 bottom-10 sm:bottom-20 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 transform origin-bottom-right"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1F2937]">BITS Pilani</p>
                <p className="text-xs text-gray-500">Just added 3 mentors! 🔥</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div 
          {...motionProps({ initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true } })}
          className="mt-20 md:mt-32 text-center bg-[#FF8000] rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 relative overflow-hidden shadow-2xl shadow-[#FF8000]/20"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Ready to claim your spot?
            </h2>
            <p className="text-white/90 text-base sm:text-lg mb-8 sm:mb-10 font-medium px-4 sm:px-0">
              Join Mentoreo today. Build your profile, invite your campus, and start earning on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboard" className="w-full sm:w-auto">
                <Button className="bg-white text-[#FF8000] hover:bg-gray-50 px-6 sm:px-8 py-6 rounded-[20px] text-base sm:text-lg font-bold shadow-xl hover:-translate-y-1 transition-all w-full">
                  Apply as a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
