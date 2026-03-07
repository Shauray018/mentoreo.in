"use client";

import { motion } from 'motion/react';

const colleges = [
  { name: 'IIT Delhi', short: 'IITD', color: '#1a365d' },
  { name: 'IIT Bombay', short: 'IITB', color: '#2c5282' },
  { name: 'IIT Madras', short: 'IITM', color: '#2a4365' },
  { name: 'IIT Kanpur', short: 'IITK', color: '#1e3a5f' },
  { name: 'IIT Kharagpur', short: 'IITKgp', color: '#234e6f' },
  { name: 'BITS Pilani', short: 'BITS', color: '#9b2c2c' },
  { name: 'BITS Goa', short: 'BITS-G', color: '#c53030' },
  { name: 'NIT Trichy', short: 'NITT', color: '#2f855a' },
  { name: 'NIT Warangal', short: 'NITW', color: '#276749' },
  { name: 'NIT Surathkal', short: 'NITK', color: '#22543d' },
  { name: 'AIIMS Delhi', short: 'AIIMS', color: '#553c9a' },
  { name: 'IIM Ahmedabad', short: 'IIMA', color: '#6b46c1' },
  { name: 'IIM Bangalore', short: 'IIMB', color: '#805ad5' },
  { name: 'IIM Calcutta', short: 'IIMC', color: '#7c3aed' },
  { name: 'Delhi University', short: 'DU', color: '#b7791f' },
  { name: 'Mumbai University', short: 'MU', color: '#c05621' },
  { name: 'VIT Vellore', short: 'VIT', color: '#d69e2e' },
  { name: 'Manipal University', short: 'MAHE', color: '#dd6b20' },
  { name: 'SRM University', short: 'SRM', color: '#e53e3e' },
  { name: 'Jadavpur University', short: 'JU', color: '#2d3748' },
];

const firstRow = colleges.slice(0, 10);
const secondRow = colleges.slice(10, 20);

function CollegePill({ name, short, color }: { name: string; short: string; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-default shrink-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        <span className="text-[10px] tracking-tight" style={{ fontWeight: 700 }}>
          {short.length > 4 ? short.slice(0, 4) : short}
        </span>
      </div>
      <span className="text-sm text-gray-800 whitespace-nowrap" style={{ fontWeight: 600 }}>
        {name}
      </span>
    </div>
  );
}

export function CollegeMarquee() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="w-full mt-20 mb-4"
    >
      {/* Heading */}
      <p className="text-center text-gray-500 mb-8 tracking-wide" style={{ fontWeight: 500 }}>
        Verified mentors from 200+ colleges, and counting
      </p>

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#F5F1EB] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#F5F1EB] to-transparent z-10" />

        {/* Row 1 - scrolls left */}
        <div className="flex mb-4 marquee-row-1">
          <div className="flex gap-4 animate-marquee-left">
            {[...firstRow, ...firstRow].map((college, i) => (
              <CollegePill key={`r1-${i}`} {...college} />
            ))}
          </div>
          <div className="flex gap-4 animate-marquee-left ml-4" aria-hidden="true">
            {[...firstRow, ...firstRow].map((college, i) => (
              <CollegePill key={`r1d-${i}`} {...college} />
            ))}
          </div>
        </div>

        {/* Row 2 - scrolls right */}
        <div className="flex marquee-row-2">
          <div className="flex gap-4 animate-marquee-right">
            {[...secondRow, ...secondRow].map((college, i) => (
              <CollegePill key={`r2-${i}`} {...college} />
            ))}
          </div>
          <div className="flex gap-4 animate-marquee-right ml-4" aria-hidden="true">
            {[...secondRow, ...secondRow].map((college, i) => (
              <CollegePill key={`r2d-${i}`} {...college} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
