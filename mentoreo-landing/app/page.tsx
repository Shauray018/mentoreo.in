
import Navbar from "@/components/arc-navbar";
import CoreFeatures from "@/components/CoreFeatures";
import FullWidthCTA from "@/components/FullWidthCTA";
import HeroSection from "@/components/HeroSection";
import LaunchVideo from "@/components/LaunchVideo";
import ProblemStatement from "@/components/ProblemStatement";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-clip scrollbar-hide scroll-smooth bg-[#0a0a0f] text-white">
      <Navbar />
      <HeroSection />
      <LaunchVideo />
      <ProblemStatement />
      <CoreFeatures />
      <Testimonials />
      <FullWidthCTA />
    </main>
  );
}
