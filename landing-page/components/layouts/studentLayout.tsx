"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, MessageSquare, Wallet, User, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const isAuthPage = pathname === "/student/login" || pathname === "/student/signup";

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { to: "/student/dashboard", icon: Home, label: "Home" },
    { to: "/student/chats", icon: MessageSquare, label: "Inbox" },
    { to: "/student/wallet", icon: Wallet, label: "Wallet" },
    { to: "/student/profile", icon: User, label: "Profile" },
  ];

  useEffect(() => {
    if (status === "unauthenticated" && !isAuthPage) {
      router.replace("/student/login");
      return;
    }
    if (status === "authenticated" && (session?.user as any)?.role === "mentor") {
      router.replace("/mentor/dashboard");
    }
  }, [status, session, router, isAuthPage]);

  if (isAuthPage) return <>{children}</>;
  if (status === "unauthenticated" && !isAuthPage) return null;

  return (
    <div className="min-h-screen bg-[#F8F5FF] md:bg-[#F3E8FF] pb-24 md:pb-0 font-nunito relative flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E1D4FF] fixed h-full z-40">
        <div className="p-6">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <img src="/icon.jpg" alt="Mentoreo" className="w-10 h-10 rounded-xl" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
                pathname === item.to
                  ? "bg-[#9758FF] text-white shadow-md shadow-[#9758FF]/20"
                  : "text-[#6B7280] hover:bg-[#F8F5FF] hover:text-[#9758FF]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E1D4FF]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
        <div className="md:p-8 md:max-w-6xl md:mx-auto min-h-screen">
          <div className="bg-white md:rounded-[32px] md:shadow-sm md:border border-[#E1D4FF] min-h-screen md:min-h-[calc(100vh-4rem)] overflow-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Floating Bottom Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-[#E1D4FF] p-2 flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl transition-all ${
                pathname === item.to
                  ? "text-[#9758FF] bg-[#F8F5FF]"
                  : "text-[#9CA3AF] hover:text-[#9758FF]/70"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
