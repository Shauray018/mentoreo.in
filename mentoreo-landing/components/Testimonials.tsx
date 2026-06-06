
"use client";

const testimonials1 = [
  { name: "Vivian Phung", location: "New York, USA", flag: "🇺🇸", role: "iOS Engineer at Instagram", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663ba458bc75ad07b72df1c1_65d38ec49e8e7bc7f4d6eacd_ns0kxng56pv4hktgr234tcgx090tjpap%20(1).webp" },
  { name: "Kevin Parry", location: "Toronto, Canada", flag: "🇨🇦", role: "Stop-Motion Animator", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/615dbc4a7dadf56952168a91_ddasdsa.webp" },
  { name: "Hugo", location: "Paris, France", flag: "🇫🇷", role: "Journalist", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663c01f8a742a0edd446eb2d_hugo.webp" },
  { name: "Ella Emhoff", location: "Brooklyn, NY", flag: "🇺🇸", role: "Artist and Fashion Designer", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/671fd604d7265b8967aef9fc_ella-rose-emhoff-58-quirky-fn-v0-1wskv5sxwbkd1%201.webp" },
  { name: "Katie Chiou", location: "New York, USA", flag: "🇺🇸", role: "Platform at FirstMark Capital", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6639dbcf68e8afabda6e0588_615dcd23656555f63d97c9ac.webp" },
  { name: "Meher Goel", location: "New York, USA", flag: "🇺🇸", role: "Senior Product Designer Etsy", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663c0227bfa655ffa2506fd6_meher.webp" },
  { name: "Cathy Dinas", location: "Los Angeles, USA", flag: "🇺🇸", role: "Director of Operations, Backstage Capital", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/615ea4fbc20cba45bf26502f_Untitled-6-min.webp" },
  { name: "Lars", location: "New York, USA", flag: "🇺🇸", role: "Activist", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663ba5cc53ef97c5eddf4ff8_lars.webp" },
  { name: "Nicole Vignola", location: "USA", flag: "🇺🇸", role: "Neuroscientist", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/66695687bb6e5f4988d827a3_Rectangle%207.webp" },
  { name: "David Shanhun", location: "New Zealand", flag: "🇳🇿", role: "Musician", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6669559d9f28f43a3fbe2ca4_Rectangle%209.webp" },
];

const testimonials2 = [
  { name: "Dr Chris Lee", location: "USA", flag: "🇺🇸", role: "Digital Creator", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/666956fde5ff43ce97ab089b_Rectangle%208.webp" },
  { name: "Mollie Eastman", location: "USA", flag: "🇺🇸", role: "Entrepreneur", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6669572acc05779c444dd116_Rectangle%205.webp" },
  { name: "Steve Schlafman", location: "New York, USA", flag: "🇺🇸", role: "Professional Coach, Founder of HighOutput", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663ba48b8e9b69f2a0157613_3xns2TIh_400x400.webp" },
  { name: "Simone", location: "Los Angeles, CA", flag: "🇺🇸", role: "Pro Soccer Player", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663ba695148fa9bec662ad97_simone.webp" },
  { name: "Job van der Voort", location: "Amsterdam, NL", flag: "🇳🇱", role: "Co-founder and CEO of Remote", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/615dbab0152ab58b59d6b6f2_dasdsa.webp" },
  { name: "Frank Bach", location: "Los Angeles, CA", flag: "🇺🇸", role: "Lead Designer", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/615ea602f02fc7ddd3d0ab10_Untitled-15-min.webp" },
  { name: "Lily Nguyen", location: "San Francisco, USA", flag: "🇺🇸", role: "Computational Designer, Zora", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663e3bbcfaa2bf4ee00cda55_1565288970151.webp" },
  { name: "Stewart Scott-Curran", location: "San Francisco, USA", flag: "🇺🇸", role: "Senior Director of Brand at Loom", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663bf7e4f7913278edf30cf2_stewart.webp" },
  { name: "Clarkisha", location: "USA", flag: "🇺🇸", role: "Critic", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6669550d9f28f43a3fbdcd36_Rectangle%204.webp" },
];

function TestimonialCard({ t }: { t: typeof testimonials1[0] }) {
  return (
    <div className="flex-shrink-0 w-[260px] md:w-[300px] rounded-2xl overflow-hidden relative cursor-pointer hover:scale-[1.03] transition-transform duration-300 group">
      <img src={t.img} alt={t.name} className="w-full h-[340px] object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="gradient-text font-bold text-[15px] mb-1">{t.name}</div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[13px]">{t.flag}</span>
          <span className="text-white/50 text-[12px]">{t.location}</span>
        </div>
        <p className="text-white/70 text-[12px] leading-snug line-clamp-2">{t.role}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const row1 = [...testimonials1, ...testimonials1];
  const row2 = [...testimonials2, ...testimonials2];

  return (
    <section id="testimonials" className="bg-orange-400 py-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-12 text-center">
        <h3 className="text-[clamp(28px,4.5vw,56px)] font-bold tracking-[-0.02em] text-white mb-4">
          &ldquo;This app has<br/>changed my life&rdquo;
        </h3>
        <p className="text-white/55 text-[clamp(15px,1.3vw,18px)]">
          Hear how Opal transforms lives, directly from those who&apos;ve made the journey
        </p>
      </div>

      {/* Row 1 forward */}
      <div className="relative overflow-hidden mb-4">
        <div className="marquee-track flex gap-4 py-2">
          {row1.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>

      {/* Row 2 reverse */}
      <div className="relative overflow-hidden">
        <div className="marquee-track-reverse flex gap-4 py-2">
          {row2.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>
    </section>
  );
}