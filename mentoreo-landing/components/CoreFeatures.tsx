"use client";

const features = [
  {
    id: 1,
    label: "Onboarding ®",
    labelColor: "#d4a017",
    title: "SIGN IN \nIN OUR APP",
    desc: "Opal Score combines signals from your sleep, focus, and rest into a single measure of how technology aligns with your wellbeing.",
    // Warm amber/gold glow
    glowColors: ["#d4a017", "#b45309", "#92400e"],
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Onboarding_pages_for_Mentoreo-portrait.png",
    reversed: false,
  },
  {
    id: 2,
    label: "Focus Rules ®",
    labelColor: "#0891b2",
    title: "CHOOSE YOUR\nMENTOR",
    desc: "Take control of your day by blocking the apps of your choice, whether it's on your phone or desktop.",
    // Cyan/ice glow
    glowColors: ["#0891b2", "#0e7490", "#164e63"],
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Home-2-portrait.png",
    reversed: true,
  },
  {
    id: 3,
    label: "Focus Timer ®",
    labelColor: "#7c3aed",
    title: "CHAT WITH\nTHEM",
    desc: "Talk to your desirable mentor about problem you are searching solutions for!",
    // Purple/violet glow
    glowColors: ["#7c3aed", "#6d28d9", "#4c1d95"],
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Inbox-2-portrait.png",
    reversed: false,
  },
];

function MockupGlow({ colors }: { colors: string[] }) {
  const [c1, c2, c3] = colors;
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
      {/* Large outer bloom */}
      <div
        className="absolute inset-[-30%]"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 55%, ${c1}55 0%, ${c2}30 35%, ${c3}18 60%, transparent 80%)`,
          filter: "blur(28px)",
        }}
      />
      {/* Mid-layer sharper core */}
      <div
        className="absolute inset-[-10%]"
        style={{
          background: `radial-gradient(ellipse 55% 65% at 50% 52%, ${c1}70 0%, ${c2}40 30%, transparent 65%)`,
          filter: "blur(14px)",
        }}
      />
      {/* Tight bright core right behind the device */}
      <div
        className="absolute inset-[15%]"
        style={{
          background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${c1}90 0%, ${c1}55 20%, transparent 60%)`,
          filter: "blur(6px)",
        }}
      />
      {/* Floor shadow / ground reflection */}
      <div
        className="absolute bottom-[-8%] left-[15%] right-[15%] h-[35%]"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${c2}40 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />
    </div>
  );
}

export default function CoreFeatures() {
  return (
    <section id="how-to-use" className="overflow-x-clip bg-zinc-100 py-20 md:py-32">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        {features.map((f) => (
          <div
            key={f.id}
            className={`flex flex-col ${
              f.reversed ? "md:flex-row-reverse" : "md:flex-row"
            } items-center gap-10 md:gap-16 mb-28 last:mb-0`}
          >
            {/* Text */}
            <div className="flex-1 max-w-[460px]">
              {/* Label pill */}
              <div
                className="inline-flex items-center px-3 py-1 rounded-full border mb-5"
                style={{
                  borderColor: `${f.labelColor}55`,
                  background: `${f.labelColor}18`,
                }}
              >
                <span
                  className="text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: f.labelColor }}
                >
                  {f.label}
                </span>
              </div>

              {/* Headline */}
              <h2
                className="mb-5 text-[clamp(36px,5vw,58px)] font-bold leading-[0.92] tracking-[-0.02em] whitespace-pre-line"
                style={{
                  color: f.labelColor,
                  WebkitTextStroke: "2px #18181b",
                  textShadow: "4px 4px 0 #18181b",
                }}
              >
                {f.title}
              </h2>

              <p className="text-[clamp(15px,1.2vw,17px)] leading-[1.75] text-zinc-500 max-w-[380px]">
                {f.desc}
              </p>
            </div>

            {/* Mockup */}
            <div className="flex-1 relative flex items-center justify-center min-h-[320px] md:min-h-[420px]">
              <MockupGlow colors={f.glowColors} />
              <img
                src={f.mockupImg}
                alt={f.title}
                className="relative z-10 w-[120%] max-w-none h-[500px] md:h-[500px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
