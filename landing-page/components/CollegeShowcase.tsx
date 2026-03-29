"use client";

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
  { name: 'Delhi University', short: 'DU', color: '#b7791f' },
  { name: 'VIT Vellore', short: 'VIT', color: '#d69e2e' },
  { name: 'Manipal University', short: 'MAHE', color: '#dd6b20' },
  { name: 'SRM University', short: 'SRM', color: '#e53e3e' },
];

export function CollegeShowcase() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <p className="text-center text-[#1F2937]/50 text-sm sm:text-base mb-6 tracking-wide uppercase" style={{ fontWeight: 600, letterSpacing: '0.08em' }}>
        Verified mentors from 200+ colleges
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {colleges.map((college) => (
          <div
            key={college.short}
            className="flex items-center gap-2 bg-white/80 rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 border border-[#1F2937]/[0.06] hover:border-[#FF8000]/20 hover:bg-white transition-all"
          >
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: college.color }}
            >
              <span className="text-[8px] sm:text-[9px] tracking-tight" style={{ fontWeight: 700 }}>
                {college.short.length > 4 ? college.short.slice(0, 4) : college.short}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-[#1F2937]/80 whitespace-nowrap" style={{ fontWeight: 600 }}>
              {college.name}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-[#FF8000]/5 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 border border-[#FF8000]/15">
          <span className="text-xs sm:text-sm text-[#FF8000] whitespace-nowrap" style={{ fontWeight: 700 }}>
            +180 more
          </span>
        </div>
      </div>
    </div>
  );
}
