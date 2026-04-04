import { AlertTriangle, EyeOff, Landmark, Lightbulb, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { Navigation } from "../components/Navigation";

const PAIN_POINTS = [
  {
    icon: EyeOff,
    iconColor: "bg-[#F3E8FF] text-[#9810FA]",
    title: "Don't Fall for the Ads",
    description:
      'Every college brochure promises "100% placements" and a dream campus. But what happens after you pay the fees? Bypass the marketing traps. Get on a call with someone already studying there, and ask them what the college is <em class="font-bold not-italic text-[#1F2937]/90">actually</em> like behind closed doors.',
  },
  {
    icon: Landmark,
    iconColor: "bg-[#E0E7FF] text-[#4F39F6]",
    title: 'Skip the "Seen" Zone',
    description:
      "Trying to find honest advice on LinkedIn or Reddit? You'll send 50 messages just to get one vague reply. Mentoreo gives you a cheat code. For the price of a small meal, book a guaranteed 1-on-1 call with a senior. Ask all your silly questions with absolutely zero judgment.",
  },
  {
    icon: Lightbulb,
    iconColor: "bg-[#FAE8FF] text-[#C800DE]",
    title: "Don't Guess Your Future",
    description:
      "You are about to invest lakhs of rupees and the best years of your life into a degree. Don't pick your college just because your neighbors said it's good. Get the inside truth first. A 10-minute chat today can save you from 4 years of daily regret.",
  },
];

const TESTIMONIALS = [
  {
    title: '"The 100% Placement Scam"',
    text: "They told us top companies visit for placements. Bro, the only companies that came were selling credit cards and insurance. I'm doing a BBA and they wanted me to do door-to-door sales. Talk to a senior before joining.",
    author: "Anonymous, Tier 3 City College",
    style: { background: "rgba(250, 245, 255, 0.80)", borderColor: "#E9D4FF" },
  },
  {
    title: '"Google is the Real Professor"',
    text: "Professors here just read out of PPTs downloaded from the internet. I asked a doubt about a basic concept and the sir told me 'Google it, don't waste class time.' We pay 3 lakhs a year for this.",
    author: "Anonymous, State College",
    style: { background: "rgba(245, 243, 255, 0.80)", borderColor: "#DDD6FF" },
  },
  {
    title: '"Guest Lectures are a Joke"',
    text: "The 'industry experts' they brag about are just alumni who couldn't find a job, coming back to talk about hustle. There's zero career guidance here. Everyone is just preparing for govt exams on their own.",
    author: "Anonymous, Tier 2 City College",
    style: { background: "rgba(239, 246, 255, 0.80)", borderColor: "#BEDBFF" },
  },
  {
    title: '"Mac Labs? More like No Labs"',
    text: "The website showed Mac labs and high-end rendering machines. In reality, half the PCs don't even turn on and the software licenses expired in 2021. You literally have to buy your own heavy laptop to pass.",
    author: "Anonymous, Pvt Design Institute",
    style: { background: "rgba(238, 242, 255, 0.80)", borderColor: "#C6D2FF" },
  },
  {
    title: '"Hostel Photos are Fake"',
    text: "Hostel brochure: 'Airy rooms with attached washrooms'. Reality: 4 people stuffed in a room meant for 2, walls have damp spots, and the Wi-Fi blocks everything including YouTube. Don't fall for the website photos.",
    author: "Anonymous, North Campus",
    style: { background: "rgba(253, 244, 255, 0.80)", borderColor: "#F6CFFF" },
  },
  {
    title: '"Zero Practical Knowledge"',
    text: "They promised moot courts and real case studies. We haven't had a single practical session in 2 years. It's just rote learning from outdated books. If you want to actually practice law, find another college.",
    author: "Anonymous, Pvt Law College",
    style: { background: "rgba(248, 250, 252, 0.80)", borderColor: "#E2E8F0" },
  },
];

export default function WhyMentoreo() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-10 font-inter overflow-hidden relative">
      <Navigation />

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#FEF2F2] border border-[#FFE2E2] text-[#C10007] text-sm font-bold px-5 py-2.5 rounded-full mb-10 shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <AlertTriangle className="w-4 h-4" />
          The System is Rigged
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold leading-[1.1] text-[#1F2937] mb-8 tracking-tight">
          Why Mentoreo?{" "}
          <span className="text-[#9810FA]">
            Because<br className="hidden md:block" /> Marketing ≠ Reality.
          </span>
        </h1>

        <p className="text-[#1F2937]/70 text-lg md:text-2xl leading-relaxed md:leading-10 max-w-3xl mx-auto font-medium tracking-tight">
          Let&apos;s be honest. You&apos;re about to spend lakhs of rupees and 3-4 years of your life
          based on a glossy brochure and a virtual tour shot 8 years ago. We built this because{" "}
          <strong className="font-black">we&apos;re tired of students getting tricked.</strong>
        </p>
      </section>

      {/* Pain Points */}
      <section className="px-4 pb-16 md:pb-24 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((item) => (
            <div
              key={item.title}
              className="bg-white/70 rounded-[32px] border border-[#9810FA] p-8 shadow-[0_8px_30px_rgba(147,51,234,0.04),0_4px_4px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(147,51,234,0.1),0_6px_6px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.iconColor} flex items-center justify-center mb-6 shadow-[0_4px_4px_rgba(0,0,0,0.25)]`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1F2937] mb-4 tracking-tight leading-8">{item.title}</h3>
              <p
                className="text-[#1F2937]/70 text-base leading-6.5 font-medium"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Line */}
      <section className="mx-4 md:mx-auto max-w-4xl mb-16 md:mb-24 relative z-10">
        <div className="bg-[#1F2937] rounded-[40px] px-8 py-12 md:px-14 md:py-16 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 blur-xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black mb-6 text-[#FB2C36] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
              The Bottom{" "}
              <span className="underline decoration-[#FB2C36] underline-offset-4">Line</span>
            </h2>
            <p className="text-white/90 text-lg md:text-2xl leading-relaxed md:leading-10 max-w-3xl mx-auto font-medium tracking-tight">
              If spending the price of a small meal saves you from a{" "}
              <strong className="text-[#C27AFF] font-black">₹15 Lakh</strong> mistake, that&apos;s the{" "}
              <span className="underline decoration-white/40 underline-offset-4">best investment</span> you&apos;ll ever
              make for your future.
            </p>
          </div>
        </div>
      </section>

      {/* Wall of Truth */}
      <section className="px-4 md:px-12 pb-16 md:pb-24 max-w-5xl mx-auto relative z-10 pt-16 md:pt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1F2937] mb-5 tracking-tight">
            The Wall of Truth{" "}
            <span className="text-[#9810FA]" style={{ fontFamily: "'Henny Penny', cursive" }}>
              (Zero Filter)
            </span>
          </h2>
          <p className="text-[#1F2937]/70 text-base md:text-xl max-w-3xl mx-auto font-medium leading-7">
            This is where marketing brochures go to die. We&apos;ve collected these{" "}
            <strong className="font-bold">&quot;Real Talk&quot;</strong> snippets from seniors who
            finally stopped pretending everything is perfect. This is the level of honesty you get on a{" "}
            <Link href="/student/dashboard" className="text-[#9810FA] font-medium hover:underline">
              Mentoreo call
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.title}
              style={t.style}
              className="border rounded-[32px] p-8 flex flex-col justify-between shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_4px_4px_rgba(0,0,0,0.25)] hover:shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_8px_8px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-bold text-[#1F2937] leading-snug">{t.title}</h4>
                  <MessageCircle className="w-8 h-8 text-[#1F2937]/5 shrink-0 ml-3" />
                </div>
                <p className="text-[#1F2937]/80 text-base leading-6.5 font-medium italic">{t.text}</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-white/60 shadow-sm flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1F2937]/50" />
                </div>
                <span className="text-sm text-[#1F2937]/60 font-bold">— {t.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 md:pb-28 text-center relative z-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#1F2937] mb-8 tracking-tight">
          Ready to hear the truth?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/student/dashboard"
            className="px-8 py-3 bg-[#9810FA] text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_30px_rgba(147,51,234,0.25),inset_0_4px_4px_rgba(0,0,0,0.25)] hover:brightness-110 active:scale-95"
          >
            Find a Mentor Now
          </Link>
          <Link
            href="/mentor/signup"
            className="px-8 py-3 bg-white border-2 border-[#F3E8FF] text-[#1F2937] rounded-full font-bold text-lg transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-[#9810FA]/30 active:scale-95"
          >
            Become a Mentor
          </Link>
        </div>
      </section>
    </div>
  );
}
