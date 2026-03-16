"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Users, History } from "lucide-react";

import { useMentorStore } from "@/store/mentorStore";
import { Switch } from "@/app/components/ui/switch";

import { TabId, TABS } from "./constants";
import HomeTab, { LiveRequest, SessionRequest } from "./HomeTab";
import MessagesTab from "./MessagesTab";
import BoostTab from "./BoostTab";
import ProfileTab from "./ProfileTab";
import { MentorMobileNav, MentorSidebar } from "./MentorSidebar";
import { MentorHistoryPanel, MentorRequestsPanel } from "./MentorPanels";

function formatDate(date?: string) {
  if (!date) return "TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRequestedAt(date?: string) {
  if (!date) return "Just now";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}

const initialLiveRequests: LiveRequest[] = [
  {
    id: "req1",
    studentName: "Aryan Gupta",
    type: "chat",
    topic: "JEE Strategy & Mock Tests",
    timeRequested: "Just now",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rate: 5,
  },
  {
    id: "req2",
    studentName: "Neha Sharma",
    type: "call",
    topic: "College Branch Selection",
    timeRequested: "2 mins ago",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rate: 10,
  },
];

export default function MentorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    signup,
    profile,
    sessions,
    reviews,
    earnings,
    fetchAll,
    saveProfile,
    acceptSession,
    declineSession,
    clear,
  } = useMentorStore();

  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [requestsPanelOpen, setRequestsPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [liveRequests, setLiveRequests] = useState<LiveRequest[]>(initialLiveRequests);
  const [isOnline, setIsOnline] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/mentor/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) fetchAll(session.user.email);
    return () => clear();
  }, [session?.user?.email]);

  useEffect(() => {
    if (profile?.is_available !== undefined) setIsAvailable(profile.is_available);
  }, [profile?.is_available]);

  useEffect(() => {
    setRequestsPanelOpen(false);
    setHistoryPanelOpen(false);
  }, [activeTab]);

  const mentorName = profile?.display_name ?? signup?.name ?? session?.user?.name ?? "Mentor";
  const mentorEmail = signup?.email ?? session?.user?.email ?? "";
  const mentorCollege = signup?.college ?? "";
  const mentorCourse = signup?.course ?? "";

  const requests: SessionRequest[] = useMemo(
    () => sessions
      .filter((s) => s.status === "requested")
      .map((s) => ({
        id: s.id,
        studentName: s.student_name,
        studentImage: s.student_image,
        date: formatDate(s.scheduled_date),
        time: s.scheduled_time || "TBD",
        duration: `${s.duration_minutes} min`,
        earning: s.earning,
        topic: s.topic,
        requestedAt: formatRequestedAt(s.requested_at),
      })),
    [sessions]
  );

  const historySessions = useMemo(
    () => sessions
      .filter((s) => s.status === "completed")
      .map((s) => ({
        id: s.id,
        studentName: s.student_name,
        studentImage: s.student_image,
        date: formatDate(s.scheduled_date),
        duration: `${s.duration_minutes} min`,
        earning: s.earning,
        topic: s.topic,
        status: "Completed",
      })),
    [sessions]
  );

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);
    if (mentorEmail) {
      await saveProfile(mentorEmail, { is_available: value });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] md:bg-[#FFF9F5] pb-24 md:pb-0 font-nunito relative flex">
      <MentorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => signOut({ callbackUrl: "/" })}
        onLogoClick={() => router.push("/")}
      />

      <main className={`flex-1 md:ml-64 w-full max-w-full overflow-x-hidden ${activeTab === "messages" ? "h-screen flex flex-col" : ""}`}>
        <div className={`md:p-8 md:max-w-6xl md:mx-auto ${activeTab === "messages" ? "h-full flex flex-col flex-1" : "min-h-screen"}`}>
          <div className={`${activeTab === "messages" ? "flex flex-col h-full" : "bg-white md:rounded-[32px] md:shadow-sm md:border border-orange-100 min-h-screen md:min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8"}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${activeTab === "messages" ? "px-4 pt-4 md:px-0 md:pt-0" : ""}`}>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl">
                  {getInitials(mentorName)}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: "Fredoka, sans-serif" }}>
                    {TABS.find((t) => t.id === activeTab)?.label}
                  </h1>
                  <p className="text-sm text-gray-500">Welcome back, {mentorName.split(" ")[0]}!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border shadow-sm">
                  <span className="text-xs text-gray-500">Available</span>
                  <Switch checked={isAvailable} onCheckedChange={handleAvailabilityToggle} />
                </div>
                {activeTab === "profile" ? (
                  <button
                    onClick={() => setHistoryPanelOpen(!historyPanelOpen)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm text-xs transition-all ${
                      historyPanelOpen
                        ? "bg-[#FF7A1F] border-[#FF7A1F] text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <History className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Session History</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setRequestsPanelOpen(!requestsPanelOpen)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm text-xs transition-all ${
                      requestsPanelOpen
                        ? "bg-[#FF7A1F] border-[#FF7A1F] text-white"
                        : requests.length > 0
                        ? "bg-orange-50 border-orange-200 text-[#FF7A1F] hover:bg-orange-100"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Requests</span>
                    {requests.length > 0 && (
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                        requestsPanelOpen ? "bg-white text-[#FF7A1F]" : "bg-[#FF7A1F] text-white"
                      }`} style={{ fontWeight: 700 }}>
                        {requests.length}
                      </span>
                    )}
                    {requests.length > 0 && !requestsPanelOpen && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <MentorRequestsPanel
              open={requestsPanelOpen}
              onClose={() => setRequestsPanelOpen(false)}
              requests={requests}
              onAccept={acceptSession}
              onDecline={declineSession}
            />

            <MentorHistoryPanel
              open={historyPanelOpen}
              onClose={() => setHistoryPanelOpen(false)}
              sessions={historySessions}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={activeTab === "messages" ? "flex-1 min-h-0 flex flex-col px-4 pb-24 md:px-0 md:pb-0" : ""}
              >
                {activeTab === "home" && (
                  <HomeTab
                    isOnline={isOnline}
                    onToggleOnline={setIsOnline}
                    requests={requests}
                    liveRequests={liveRequests}
                    setLiveRequests={setLiveRequests}
                    onAcceptRequest={acceptSession}
                    onDeclineRequest={declineSession}
                    onGoBoost={() => setActiveTab("boost")}
                  />
                )}
                {activeTab === "messages" && <MessagesTab />}
                {activeTab === "boost" && <BoostTab />}
                {activeTab === "profile" && (
                  <ProfileTab
                    signupName={mentorName}
                    signupEmail={mentorEmail}
                    signupCollege={mentorCollege}
                    signupCourse={mentorCourse}
                    profile={profile}
                    earnings={earnings}
                    reviews={reviews}
                    sessions={sessions}
                    onSaveProfile={(patch) => mentorEmail ? saveProfile(mentorEmail, patch) : Promise.resolve()}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MentorMobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
