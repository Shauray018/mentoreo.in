"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, MessageSquare, Wallet, User, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useStudentStore } from "@/store/studentStore";
import { useStudentData } from "@/hooks/useStudentData";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { buildCometUid } from "@/lib/cometchat-uid";
import { toast } from "sonner";

export default function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const isAuthPage = pathname === "/student/login" || pathname === "/student/signup";
  const { chats } = useStudentStore();
  const onlineMentors = useOnlineMentors();
  const notifiedRef = useRef<Set<string>>(new Set());

  useStudentData(session?.user?.email ?? undefined);

  const unreadCount = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
    [chats]
  );

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

  useEffect(() => {
    if (isAuthPage) return;
    if (!chats.length) return;
    if (pathname.startsWith("/student/chats")) return;

    const onlineSet = onlineMentors;
    const notified = notifiedRef.current;

    // Clear flags for mentors that went offline so we can notify next time.
    for (const key of Array.from(notified)) {
      if (!onlineSet.has(key)) notified.delete(key);
    }

    chats.forEach((chat) => {
      const mentorEmail = chat.mentor_email;
      if (!mentorEmail) return;
      if (!onlineSet.has(mentorEmail)) return;
      if (notified.has(mentorEmail)) return;

      notified.add(mentorEmail);
      toast.custom(
        () => (
          <div className="w-full max-w-sm bg-white border border-[#E1D4FF] shadow-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#9758FF] font-black">
              M
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#111827]">{chat.mentor_name ?? "Mentor"} is online</p>
              <p className="text-xs text-[#6B7280]">Tap to jump into the chat.</p>
            </div>
            <button
              onClick={() =>
                router.push(`/student/chats/${buildCometUid(mentorEmail)}?mentor=${encodeURIComponent(mentorEmail)}`)
              }
              className="px-3 py-1.5 rounded-full bg-[#9758FF] text-white text-xs font-bold hover:bg-[#8A4CE6]"
            >
              Open
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    });
  }, [chats, onlineMentors, pathname, router, isAuthPage]);

  if (isAuthPage) return <>{children}</>;
  if (status === "unauthenticated" && !isAuthPage) return null;

  return (
    <div className="min-h-screen bg-[#F8F5FF] md:bg-[#F3E8FF] pb-24 md:pb-0 font-nunito relative flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E1D4FF] fixed h-full z-40">
        <div className="p-6">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <img src="/student-logo.png" alt="Mentoreo" className="w-10 h-10 rounded-xl" />
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
              <span className="flex items-center gap-2">
                {item.label}
                {item.to === "/student/chats" && unreadCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pathname === item.to ? "bg-white/90 text-[#9758FF]" : "bg-[#9758FF]/10 text-[#9758FF]"
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </span>
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
              <div className="relative">
                <item.icon className="h-5 w-5 mb-1" />
                {item.to === "/student/chats" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1.5 rounded-full bg-[#9758FF] text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
