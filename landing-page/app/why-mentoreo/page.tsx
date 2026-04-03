import { AlertTriangle, EyeOff, Landmark, Lightbulb, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { Navigation } from "../components/Navigation";

const PAIN_POINTS = [
  {
    icon: EyeOff,
    color: "bg-purple-100 text-purple-600",
    title: "Don't Fall for the Ads",
    description:
      'Every college brochure promises "100% placements" and a dream campus. But what happens after you pay the fees? Bypass the marketing traps. Get on a call with someone already studying there, and ask them what the college is actually like behind closed doors.',
  },
  {
    icon: Landmark,
    color: "bg-blue-100 text-blue-600",
    title: 'Skip the "Seen" Zone',
    description:
      "Trying to find honest advice on LinkedIn or Reddit? You'll send 50 messages just to get one vague reply. Mentoreo gives you a cheat code. For the price of a small meal, book a guaranteed 1-on-1 call with a senior. Ask all your silly questions with absolutely zero judgment.",
  },
  {
    icon: Lightbulb,
    color: "bg-orange-100 text-orange-600",
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
  },
  {
    title: '"Google is the Real Professor"',
    text: "Professors here just read out of PPTs downloaded from the internet. I asked a doubt about a basic concept and the sir told me 'Google it, don't waste class time.' We pay 3 lakhs a year for this.",
    author: "Anonymous, State College",
  },
  {
    title: '"Guest Lectures are a Joke"',
    text: "The 'industry experts' they brag about are just alumni who couldn't find a job, coming back to talk about hustle. There's zero career guidance here. Everyone is just preparing for govt exams on their own.",
    author: "Anonymous, Tier 2 City College",
  },
  {
    title: '"Mac Labs? More like No Labs"',
    text: "The website showed Mac labs and high-end rendering machines. In reality, half the PCs don't even turn on and the software licenses expired in 2021. You literally have to buy your own heavy laptop to pass.",
    author: "Anonymous, Pvt Design Institute",
  },
  {
    title: '"Hostel Photos are Fake"',
    text: "Hostel brochure: 'Airy rooms with attached washrooms'. Reality: 4 people stuffed in a room meant for 2, walls have damp spots, and the Wi-Fi blocks everything including YouTube. Don't fall for the website photos.",
    author: "Anonymous, North Campus",
  },
  {
    title: '"Zero Practical Knowledge"',
    text: "They promised moot courts and real case studies. We haven't had a single practical session in 2 years. It's just rote learning from outdated books. If you want to actually practice law, find another college.",
    author: "Anonymous, Pvt Law College",
  },
];

export default function WhyMentoreo() {
  return (
    <div className="min-h-screen bg-[#F8F5FF] font-nunito pt-24 overflow-hidden relative">
      <Navigation />

      {/* Background orbs */}
      <div className="absolute top-0 left-[-20%] w-[60%] h-[60%] bg-[#9758FF]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[50%] h-[50%] bg-[#C084FC]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center max-w-3xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-2.5 rounded-full mb-8 shadow-sm">
          <AlertTriangle className="w-4 h-4" />
          The System is Rigged
        </div>

        <h1
          className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#111827] mb-6"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Why Mentoreo?{" "}
          <span className="bg-linear-to-r from-[#9758FF] to-[#C084FC] bg-clip-text text-transparent">
            Because Marketing ≠ Reality.
          </span>
        </h1>

        <p className="text-[#4B5563] text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
          Let&apos;s be honest. You&apos;re about to spend lakhs of rupees and 3-4 years of your life
          based on a glossy brochure and a virtual tour shot 8 years ago. We built this because{" "}
          <strong className="text-[#111827]">we&apos;re tired of students getting tricked.</strong>
        </p>
      </section>

      {/* Pain Points */}
      <section className="px-4 pb-16 md:pb-24 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((item) => (
            <div
              key={item.title}
              className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-10px_rgba(151,88,255,0.15)] hover:border-[#E9D5FF] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3" style={{ fontFamily: "Fredoka, sans-serif" }}>{item.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Line */}
      <section className="mx-4 md:mx-auto max-w-4xl mb-16 md:mb-24 relative z-10">
        <div className="bg-[#1E1B2E] rounded-3xl px-6 py-12 md:px-16 md:py-16 text-center shadow-2xl shadow-[#1E1B2E]/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <h2
              className="text-3xl md:text-5xl font-black mb-5"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              <span className="bg-linear-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent italic underline decoration-[#FF6B6B]/30 underline-offset-4">
                The Bottom Line
              </span>
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              If spending the price of a small meal saves you from a{" "}
              <strong className="text-white bg-[#FF6B6B]/20 px-1.5 py-0.5 rounded">₹15 Lakh</strong> mistake, that&apos;s the{" "}
              <span className="underline decoration-white/40 underline-offset-2">best investment</span> you&apos;ll ever
              make for your future.
            </p>
          </div>
        </div>
      </section>

      {/* Wall of Truth */}
      <section className="px-4 pb-16 md:pb-24 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-black text-[#111827] mb-4"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            The Wall of Truth{" "}
            <span
              className="bg-linear-to-r from-[#9758FF] to-[#C084FC] bg-clip-text text-transparent"
              style={{ fontFamily: "cursive" }}
            >
              (Zero Filter)
            </span>
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            This is where marketing brochures go to die. We&apos;ve collected these{" "}
            <strong className="text-[#111827]">&quot;Real Talk&quot;</strong> snippets from seniors who
            finally stopped pretending everything is perfect. This is the level of honesty you get on a{" "}
            <Link href="/student/dashboard" className="text-[#9758FF] font-bold hover:underline">
              Mentoreo call
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.title}
              className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-10px_rgba(151,88,255,0.15)] hover:border-[#E9D5FF] transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-base font-bold text-[#111827] leading-snug">{t.title}</h4>
                  <MessageCircle className="w-5 h-5 text-gray-200 shrink-0 ml-2 mt-0.5" />
                </div>
                <p className="text-[#6B7280] text-sm leading-relaxed font-medium italic">{t.text}</p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#9758FF]" />
                </div>
                <span className="text-xs text-[#9CA3AF] font-semibold">— {t.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 md:pb-28 text-center relative z-10">
        <h2
          className="text-2xl md:text-3xl font-black text-[#111827] mb-8"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Ready to hear the truth?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/student/dashboard"
            className="px-8 py-3.5 bg-[#9758FF] hover:bg-[#8B5CF6] text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-[#9758FF]/25 active:scale-95"
          >
            Find a Mentor Now
          </Link>
          <Link
            href="/mentor/signup"
            className="px-8 py-3.5 bg-white border-2 border-gray-200 hover:border-[#9758FF]/30 text-[#111827] rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm"
          >
            Become a Mentor
          </Link>
        </div>
      </section>
    </div>
  );
}
