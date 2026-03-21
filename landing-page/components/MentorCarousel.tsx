"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlareHover from './GlareHover';

const MENTORS = [
  {
    id: 1,
    name: 'Divig Bansal',
    title: 'JEE Topper (247 AIR)',
    college: 'IIT Bombay',
    img: '/divig3.png',
  },
  {
    id: 2,
    name: 'Aditya Sharma',
    title: 'JEE Topper',
    college: 'PEC Chandigarh',
    img: '/aadi.png',
  },
  {
    id: 3,
    name: 'Isha',
    title: 'NEET Topper',
    college: 'GMERS MEDICAL COLLEGE',
    img: 'https://jyjzhuevnslcmjauguaz.supabase.co/storage/v1/object/public/avatars/isha0904@icloud.com/avatar.jpeg',
  },
  {
    id: 4,
    name: 'Ojas Kampani',
    title: 'JEE Topper',
    college: 'PEC Chandigarh',
    img: 'https://jyjzhuevnslcmjauguaz.supabase.co/storage/v1/object/public/avatars/kampani.ojas@gmail.com/avatar.jpg',
  }
];

function MentorCard({ mentor }: { mentor: typeof MENTORS[0] }) {
  return (
    <GlareHover
      width="100%"
      height="auto"
      background="white"
      borderRadius="32px"
      borderColor="rgba(255,128,0,0.1)"
      glareColor="#fff"
      glareOpacity={0.12}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      playOnce={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '16px',
        boxShadow: '0 8px 30px rgba(31,41,55,0.06)',
      }}
      className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden mb-5 group-hover:scale-[1.02] transition-transform duration-300">
        <img src={mentor.img} alt={mentor.name} className="w-full h-full object-cover" />
      </div>
      <div className="px-2 pb-2">
        <h3 className="text-[22px] text-[#1F2937] mb-0.5" style={{ fontWeight: 800 }}>
          {mentor.name}
        </h3>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[#1F2937] font-bold text-base">{mentor.title}</span>
          <span className="text-sm text-[#1F2937]/70 font-medium">{mentor.college}</span>
        </div>
      </div>
    </GlareHover>
  );
}

// Returns N consecutive mentors starting at `startIndex`, wrapping around
function getVisible(startIndex: number, count: number) {
  return Array.from({ length: count }, (_, offset) => ({
    mentor: MENTORS[(startIndex + offset) % MENTORS.length],
    offset,
  }));
}

function MentorCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setStartIndex((prev) => (prev + 1) % MENTORS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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

  const visibleCount = isMobile ? 1 : 3;
  const visible = getVisible(startIndex, visibleCount);

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map(({ mentor, offset }) => (
            <motion.div
              key={mentor.id}
              layout
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{
                duration: 0.45,
                ease: 'easeInOut',
                delay: offset * 0.07, // stagger each card slightly
              }}
            >
              <MentorCard mentor={mentor} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {MENTORS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > startIndex ? 1 : -1);
              setStartIndex(i);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === startIndex ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function MentorSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full mb-12 sm:mb-16"
    >
      <MentorCarousel />
    </motion.div>
  );
}
