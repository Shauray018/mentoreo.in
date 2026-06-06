"use client";

const features = [
  {
    id: 1,
    label: "Onboarding ®",
    labelColor: "#d4a017",
    title: "SIGN IN \nIN OUR APP",
    desc: "Opal Score combines signals from your sleep, focus, and rest into a single measure of how technology aligns with your wellbeing.",
    glowImg: "https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663fb9cf28994c3d492cc787_yellow-glow.webp",
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Onboarding_pages_for_Mentoreo-portrait.png",
    reversed: false,
  },
  {
    id: 2,
    label: "Focus Rules ®",
    labelColor: "#0891b2",
    title: "CHOOSE YOUR\nMENTOR",
    desc: "Take control of your day by blocking the apps of your choice, whether it's on your phone or desktop.",
    glowImg: "https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663fb9cfd48ced9107a3d84b_ice-glow.webp",
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Home-2-portrait.png",
    reversed: true,
  },
  {
    id: 3,
    label: "Focus Timer ®",
    labelColor: "#7c3aed",
    title: "TAP INTO\nFOCUS",
    desc: "Choose what you want to focus on, set the length, and lock in until the timer runs out.",
    glowImg: "https://cdn.prod.website-files.com/5ffc51a847b677701a3da52b/663fb9cff782fc93b5c061bd_blue-glow.webp",
    mockupImg: "/samsung-galaxy-s24-ultra-mockup/Inbox-2-portrait.png",
    reversed: false,
  },
];

export default function CoreFeatures() {
  return (
    <section id="how-to-use" className="bg-zinc-100 py-20 md:py-32">
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

              {/* Headline: stroke + hard shadow adapted for light bg */}
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
              <img
                src={f.glowImg}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none select-none blur-[10px] scale-110"
              />
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