"use client";

const gems = [
  { name: "Diligent Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f94a6fe89bf63a8faee6_p1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b550eee62333eab991b5f___MileStone_P1_Halo.webp" },
  { name: "Unwavering Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634d0cab4efd03f8008aeda_a1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5f1f09b65e7f28910407___MileStone_A1_Halo.webp" },
  { name: "Committed Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f88f20447e04e590b19c_e1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5e958595ecae8ca1d9b0___MileStone_E1_Halo.webp" },
  { name: "Driven Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f8bb3e29f484a43db2bf_g1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5e62137277924935f6a2___MileStone_G1_Halo.webp" },
  { name: "First Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634d0e2c781df2905a3954a_b1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5ef5daab4d222941125a___MileStone_B1_Halo.webp" },
  { name: "Balanced Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f8879e2252f74db7be77_d1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5ea75bafc87c618d1551___MileStone_D1_Halo.webp" },
  { name: "Motivated Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f8f639ed9ab380d08cb9_j1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5e19e71f76bd856a5078___MileStone_J1_Halo.webp" },
  { name: "Dutiful Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f916ef5c1e4220d4c187_m1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b568913b2dcc9b8a1155d___MileStone_M1_Halo.webp" },
  { name: "Loyal Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f90a1e65c7b32534123f_l1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5defee62333eaba048c0___MileStone_L1_Halo.webp" },
  { name: "Soulful Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f8c40ad0414c70954718_h1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5e472fef312df64e1e33___MileStone_H1_halo.webp" },
  { name: "Original Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f8edf1a9874386665581_i1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5e2b35914ebdd0ddaaf5___MileStone_I1_Halo.webp" },
  { name: "Determined Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f940af7ba70d15071bc3_o1.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b561eff766a021ab93077___MileStone_O1_Halo.webp" },
];

const seasonalGems = [
  { name: "Earth Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f96caf7ba70d15073d73_earth-day.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b53d1c80a9b943149b5cb_EarthDay_Halo_3000.webp" },
  { name: "Easter Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f983722053cb977afaf5_easter.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b53f1c80a9b943149d518_Easter_Halo_3000.webp" },
  { name: "Holi Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f9937c2f7b91136fd902_holi.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b51e22fef312df643c1c3_Holi_Halo_3000.webp" },
  { name: "Love Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634fa2ca20e36a84b4ea6a5_valentines-day.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b4e19e2f052b84bde884e_ValentinesDay_Halo_3000.webp" },
  { name: "Spring Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f9df57f61fbc33007d21_spring.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b51271b294d1ca4af7c84_Spring_Halo_3000.webp" },
  { name: "Summer Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634fa0f20447e04e591c07b_summer.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b5055c80a9b9431471718_Summer_Halo_3000.webp" },
  { name: "Ramadan Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634f9d1e7b97dba9e11a540_ramadan.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b516709b65e7f2884af25_Ramadan_Halo_3000.webp" },
  { name: "Winter Gem", img: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/6634fa490d42907abde66a52_winter.webp", halo: "https://cdn.prod.website-files.com/600af2a75eac7614a9682354/663b4de6edb2d7b57e85de5e_Winter_Halo_3000.webp" },
];

const blueGlow = "https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663b83f8102cc221877b093d_blue-glow.webp";
const gemStand = "https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/66382855a3042435a7923e8b_gem-stand.png";

function GemCard({ gem }: { gem: typeof gems[0] }) {
  return (
    <div className="gradient-border-card relative flex-shrink-0 w-[180px] md:w-[200px] p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
      <img src={blueGlow} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none rounded-[20px]" />
      <div className="relative w-[120px] h-[140px] flex items-end justify-center">
        <img src={gem.halo} alt="" className="absolute inset-0 w-full h-full object-contain opacity-80 pointer-events-none" />
        <img src={gem.img} alt={gem.name} className="relative z-10 w-[100px] h-[100px] object-contain" />
        <img src={gemStand} alt="" className="absolute bottom-0 left-0 right-0 w-full object-contain opacity-70" />
      </div>
      <span className="text-[12px] font-semibold text-white/80 text-center">{gem.name}</span>
    </div>
  );
}

export default function HallOfGems() {
  const allGems = [...gems, ...gems];
  const allSeasonal = [...seasonalGems, ...seasonalGems];

  return (
    <section id="hall-of-gems" className="bg-zinc-100 py-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-12 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#f5b8af30] bg-[#f5b8af10] mb-4">
          <span className="text-[12px] font-semibold tracking-wider text-[#f5b8af]">Focus Gems ®</span>
        </div>
        <h3 className="text-[clamp(28px,4vw,52px)] font-bold tracking-[-0.02em] text-white mb-4">
          Unlock precious Milestones
        </h3>
        <p className="text-white/55 text-[clamp(15px,1.3vw,18px)]">
          Discover beautiful rewards that celebrate every moment of focus
        </p>
      </div>

      {/* Row 1 – forward */}
      <div className="relative overflow-hidden mb-4">
        <div className="marquee-track flex gap-4 py-2">
          {allGems.map((gem, i) => <GemCard key={i} gem={gem} />)}
        </div>
      </div>

      {/* Row 2 – reverse */}
      <div className="relative overflow-hidden">
        <div className="marquee-track-reverse flex gap-4 py-2">
          {allSeasonal.map((gem, i) => <GemCard key={i} gem={gem} />)}
        </div>
      </div>
    </section>
  );
}