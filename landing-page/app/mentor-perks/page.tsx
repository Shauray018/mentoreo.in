import { Target, TrendingUp, Flame, Users, Crown, ChevronRight, ChevronDown, Banknote, Zap } from "lucide-react";
import Link from "next/link";
import { Navigation } from "../components/Navigation";

const LEADERBOARD = [
  { rank: 1, name: "IIT Bombay", points: 342, bar: "95%", accent: "gold" as const },
  { rank: 2, name: "BITS Pilani", points: 315, bar: "85%", accent: "silver" as const },
  { rank: 3, name: "NIT Trichy", points: 280, bar: "75%", accent: "orange" as const },
  { rank: 4, name: "SRCC Delhi", points: 210, bar: "0%", accent: "gray" as const },
];

const RANK_STYLES = {
  gold: {
    bg: "bg-[#FEFCE8]/50",
    border: "border-[#FFF085]",
    stripe: "bg-[#F0B100]",
    circle: "bg-[#FEF9C2] border-[#FFF085] text-[#A65F00]",
    barBg: "bg-[#FFF085]/50",
    barFill: "bg-[#F0B100]",
    label: "text-[#F0B100]",
  },
  silver: {
    bg: "bg-[#F9FAFB]",
    border: "border-[#E5E7EB]",
    stripe: "bg-[#D1D5DC]",
    circle: "bg-[#E5E7EB] border-[#D1D5DC] text-[#4A5565]",
    barBg: "bg-[#E5E7EB]",
    barFill: "bg-[#99A1AF]",
    label: "text-[#323232]",
  },
  orange: {
    bg: "bg-white",
    border: "border-[#FFEDD4]",
    stripe: "bg-[#FF8000]/40",
    circle: "bg-[#FFF7ED] border-[#FFEDD4] text-[#FF8000]",
    barBg: "bg-[#F3F4F6]",
    barFill: "bg-[#FF8000]/50",
    label: "text-[#F9BA7B]",
  },
  gray: {
    bg: "bg-white opacity-75",
    border: "border-[#F3F4F6]",
    stripe: "",
    circle: "bg-[#F9FAFB] border-[#F3F4F6] text-[#99A1AF]",
    barBg: "",
    barFill: "",
    label: "",
  },
};

export default function MentorPerks() {
  return (
    <div className="min-h-screen bg-[#FFF9F5] font-inter pt-24 overflow-hidden relative">
      <Navigation />

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 md:pt-8 md:pb-20 text-center max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/60 border border-[#FF8000]/20 text-[#FF8000] text-sm font-bold px-5 py-2.5 rounded-full mb-8 shadow-sm">
          <Zap className="w-4 h-4" />
          Not just another gig
        </div>

        <h1 className="text-4xl md:text-[64px] font-extrabold leading-[1.03] text-[#1F2937] mb-6 tracking-tight">
          Get paid to be the{" "}
          <br className="hidden md:block" />
          <span className="text-[#FF8000]">senior</span> you never had.
        </h1>

        <p className="text-[#1F2937]/70 text-lg md:text-xl leading-relaxed md:leading-8 max-w-3xl mx-auto font-medium">
          Mentoreo isn&apos;t just about giving advice. It&apos;s about building your brand, expanding
          your network, and stacking cash while helping juniors navigate college.
        </p>
      </section>

      {/* Bento Grid */}
      <section className="px-4 md:px-8 pb-20 md:pb-32 max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          {/* Large Card */}
          <div className="relative overflow-hidden rounded-[32px] border border-[#FFEDD4] p-8 md:p-12 backdrop-blur-sm" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 200, 144, 0.70) 9%, rgba(255, 255, 255, 0.70) 100%)" }}>
            <div className="absolute top-[-79px] right-[-40px] w-64 h-64 rounded-full blur-[64px]" style={{ background: "linear-gradient(225deg, rgba(255,128,0,0.15) 0%, transparent 100%)" }} />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#FFEDD4] text-[#FF8000] rounded-2xl flex items-center justify-center mb-8">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl md:text-[30px] font-bold text-[#1F2937] mb-4 leading-9">Work on your own terms.</h3>
              <p className="text-[#1F2937]/70 text-base leading-7 max-w-md mb-8 font-medium">
                <span className="font-semibold">Got midterms?</span> Turn off your availability.{" "}
                <span className="font-semibold">Free weekend?</span> Open up 5 slots. You have{" "}
                <span className="text-[#FF8000] font-extrabold">100% control</span> over your schedule and pricing.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Set your hours", "Set your rates", "1-on-1 calls"].map((tag) => (
                  <span key={tag} className="px-4 py-2.5 bg-white rounded-full text-sm font-bold text-[#1F2937]/80 shadow-sm border border-[#FFF7ED]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tall Card */}
          <div className="rounded-[32px] p-8 md:p-12 shadow-[inset_0_8px_10px_-6px_rgba(0,0,0,0.1),inset_0_20px_25px_-5px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden relative flex flex-col justify-between text-white min-h-[400px]" style={{ background: "linear-gradient(180deg, #1F2937 0%, #101828 100%)" }}>
            <div className="absolute inset-0 opacity-10" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 leading-8">Instant Resume Boost.</h3>
              <p className="text-white/70 text-lg leading-7">
                &quot;Mentored 50+ students on Mentoreo&quot; looks significantly better on a resume than
                joining another random college society.
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF8000] w-[75%] rounded-full" />
              </div>
              <p className="text-white/50 text-sm font-bold mt-3 text-right">Top 5% of Mentors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Boost Section */}
      <section className="relative pb-20 md:pb-32">
        <div className="absolute inset-0 -mx-[50vw] px-[50vw] pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,128,0,0.05) 50%, transparent 100%)" }} />

        <div className="text-center max-w-5xl mx-auto mb-12 md:mb-16 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF8000] text-white font-black text-sm tracking-wider uppercase mb-6 shadow-[0_4px_6px_-4px_rgba(255,128,0,0.3),0_10px_15px_-3px_rgba(255,128,0,0.3)]">
            <Flame className="w-4 h-4 fill-white" /> Feature Alert
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-[#1F2937] mb-4 leading-tight tracking-tight">
            Introducing{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #FF8000, #EF4444)" }}>
              Campus Boost
            </span>
          </h2>
        </div>

        {/* Three Cards */}
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 md:gap-6 max-w-7xl mx-auto px-4 relative z-10">
          {/* The Play */}
          <div className="bg-white/80 p-8 rounded-[32px] shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_8px_30px_rgba(255,128,0,0.05)] border border-[#FFEDD4] w-full lg:w-1/3 text-center flex flex-col">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl mx-auto flex items-center justify-center mb-5">
              <Users className="w-8 h-8 text-[#2B7FFF]" />
            </div>
            <h4 className="font-black text-[#1F2937] text-2xl md:text-[32px] mb-3">The Play</h4>
            <p className="text-sm text-[#1F2937]/70 font-medium mb-6 flex-grow">
              Bring your batchmates on board. More mentors from your college = more active power.
            </p>
            <div className="mt-auto bg-[#F9FAFB]/80 rounded-[14px] p-4 border border-[#0055FF]/50 shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-left">
              <span className="text-[10px] font-black text-[#FF6467] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Flame className="w-3 h-3" /> The Grind
              </span>
              <p className="text-xs text-[#6A7282] font-medium leading-5">
                Each mentor added adds one point to the leaderboard along with additional one points for every session.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:flex items-center justify-center w-8">
            <ChevronRight className="w-8 h-8 text-[#FFD6A7]" />
          </div>
          <div className="lg:hidden flex items-center justify-center py-2">
            <ChevronDown className="w-8 h-8 text-[#FFD6A7]" />
          </div>

          {/* The Goal */}
          <div className="bg-white/80 p-8 rounded-[32px] shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_8px_30px_rgba(255,128,0,0.05)] border border-[#FFEDD4] w-full lg:w-1/3 text-center flex flex-col">
            <div className="w-16 h-16 bg-[#FFF7ED] rounded-2xl mx-auto flex items-center justify-center mb-5 relative">
              <Target className="w-8 h-8 text-[#FF8000]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8000] rounded-full border-2 border-white opacity-50" />
            </div>
            <h4 className="font-black text-[#1F2937] text-2xl md:text-[32px] mb-3">The Goal</h4>
            <p className="text-sm text-[#1F2937]/70 font-medium mb-6 flex-grow">
              Hit the #1 spot on the platform leaderboard by the last day of the week.
            </p>
            <div className="mt-auto bg-[#FFF7ED]/50 rounded-[14px] p-4 border border-[#FF8000]/50 shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-left">
              <span className="text-[10px] font-black text-[#FF8000] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Status
              </span>
              <p className="text-xs text-[#4A5565] font-medium leading-5">
                Leaderboard standings update live based only on campus activity.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:flex items-center justify-center w-8">
            <span className="text-4xl font-black text-[#FFD6A8]">=</span>
          </div>
          <div className="lg:hidden flex items-center justify-center py-2">
            <span className="text-4xl font-black text-[#FFD6A8]">=</span>
          </div>

          {/* The Reward */}
          <div className="p-8 rounded-[32px] shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_20px_40px_-15px_rgba(255,128,0,0.4)] border border-[#FFDF20] w-full lg:w-1/3 text-center flex flex-col relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FDC700 0%, #FF8000 100%)" }}>
            <div className="absolute inset-0 opacity-10 rounded-[32px]" />
            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-5 relative z-10">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-black text-white text-2xl md:text-[32px] mb-3 relative z-10">The Reward</h4>
            <p className="text-sm text-white/90 font-medium mb-6 flex-grow relative z-10">
              If your campus is in the top 3, <strong className="text-white font-bold">every mentor</strong> from your college wins big.
            </p>
            <div className="mt-auto bg-white/10 rounded-[14px] p-4 border border-white/20 text-left relative z-10">
              <span className="text-[10px] font-black text-[#FFF085] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Banknote className="w-3 h-3" /> HIGHER Payout Unlocked
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto relative z-10 px-4 mt-16 md:mt-24">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_-15px_rgba(255,128,0,0.1)] border-2 border-[#FFF7ED] overflow-hidden">
            {/* Header */}
            <div className="bg-[#1F2937] p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" />
              <h3 className="text-2xl md:text-[30px] font-bold relative z-10 mb-2 leading-9">Live Standings</h3>
              <div className="flex items-center justify-center gap-2 relative z-10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#05DF72] opacity-40 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C950]" />
                </span>
                <p className="text-[#05DF72] text-sm font-bold tracking-widest uppercase">Live Mentor Count</p>
              </div>
            </div>

            {/* Rows */}
            <div className="p-4 md:p-8 space-y-5" style={{ background: "linear-gradient(180deg, white 0%, rgba(255,247,237,0.3) 100%)" }}>
              {LEADERBOARD.map((item) => {
                const s = RANK_STYLES[item.accent];
                return (
                  <div key={item.rank} className={`p-5 ${s.bg} ${s.border} border rounded-2xl relative overflow-hidden`}>
                    {s.stripe && <div className={`absolute top-0 left-0 w-1.5 h-full ${s.stripe}`} />}
                    <div className="flex items-center justify-between mb-4 pl-3">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full ${s.circle} border flex items-center justify-center font-black text-xl shadow-inner`}>
                          {item.rank}
                        </div>
                        <div>
                          <p className={`font-bold text-[#1F2937] ${item.rank === 1 ? "text-xl" : "text-lg"}`}>{item.name}</p>
                          {item.rank <= 3 && (
                            <p className={`text-xs font-black uppercase tracking-widest mt-0.5 ${s.label}`}>
                              HIGHER Payout Unlocked
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-[#1F2937] ${item.rank === 1 ? "text-3xl" : item.rank <= 3 ? "text-2xl" : "text-xl"}`}>
                          {item.points}
                        </p>
                        <p className="text-xs text-[#6A7282] font-black uppercase tracking-wider">Points</p>
                      </div>
                    </div>
                    {item.rank <= 3 && (
                      <div className={`w-full ${s.barBg} rounded-full ${item.rank === 1 ? "h-2.5" : "h-2"} mt-2`}>
                        <div className={`${s.barFill} h-full rounded-full relative overflow-hidden`} style={{ width: item.bar }}>
                          {item.rank === 1 && (
                            <div className="absolute inset-0 animate-[shimmer_2s_infinite]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keep It Simple */}
          <div className="mt-10 text-center relative z-10">
            <h3 className="text-3xl md:text-6xl font-black text-[#FB2C36] mb-6 leading-tight">
              Let&apos;s keep it simple.
            </h3>
            <p className="text-xl md:text-2xl font-bold text-[#1F2937]/90 leading-10 tracking-tight">
              Help us grow, and we&apos;ll boost your paycheck.
              <br />
              Every single week. No t&amp;c, just more earnings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 md:mx-8 mb-20 max-w-5xl md:mx-auto relative z-10">
        <div className="rounded-[40px] px-8 py-12 md:px-16 md:py-16 text-center shadow-[inset_0_25px_50px_-12px_rgba(255,128,0,0.2)] relative overflow-hidden" style={{ background: "linear-gradient(90deg, #C27AFF 0%, #FF8000 100%)" }}>
          <div className="absolute top-[-80px] right-[-40px] w-64 h-64 bg-white/20 rounded-full blur-[64px]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
              Ready to claim your spot?
            </h2>
            <p className="text-white/90 text-lg leading-7 mb-10 font-medium">
              Join Mentoreo today. Build your profile, invite your campus, and start earning on your terms.
            </p>
            <Link
              href="/onboard"
              className="inline-block px-8 py-3 bg-white text-[#FF8000] rounded-[20px] text-lg font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_4px_4px_rgba(0,0,0,0.25)] hover:brightness-105 active:scale-95 transition-all"
            >
              Apply as a Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
