"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { History } from "lucide-react";

import { useMentorStore } from "@/store/mentorStore";
import { useMentorData } from "@/hooks/useMentorData";
import { Switch } from "@/app/components/ui/switch";

import { TabId, TABS } from "./constants";
import HomeTab, { LiveRequest, SessionRequest, TodaySession } from "./HomeTab";
import MessagesTab from "./MessagesTab";
import { buildCometUid } from "@/lib/cometchat-uid";
import BoostTab from "./BoostTab";
import ProfileTab from "./ProfileTab";
import { MentorMobileNav, MentorSidebar } from "./MentorSidebar";
import { MentorHistoryPanel } from "./MentorPanels";
import { useMentorPresence } from "@/hooks/useMentorPresence";
import { sendSessionReady, sendSessionStatusUpdate, subscribeSessionBookings, subscribeSessionStarts } from "@/services/liveRequests";
import { subscribeLiveRequests, fetchPendingLiveRequests, updateLiveRequestStatus, subscribeSessionEndDb, LiveRequestRow } from "@/services/liveRequestsDb";
import { createStudentChat } from "@/services/studentApi";
import { ensureCometChatUser } from "@/services/cometchatApi";
import { liveToast } from "@/store/liveToastStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

function formatDate(date?: string) {
  if (!date) return "TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime12(time?: string) {
  if (!time) return "TBD";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${meridiem}`;
}

function formatRequestedAt(date?: string) {
  if (!date) return "Just now";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}


export default function MentorDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const {
    signup,
    profile,
    sessions,
    reviews,
    earnings,
    saveProfile,
    acceptSession,
    declineSession,
    fetchSessions,
  } = useMentorStore();

  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [liveRequests, setLiveRequests] = useState<LiveRequest[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Hide bottom nav on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > lastScrollY.current && y > 50);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/mentor/login");
  }, [status, router]);

  useEffect(() => {
    const tab = (searchParams.get("tab") as TabId | null) ?? null;
    if (!tab) return;
    if (TABS.some((t) => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const shouldOpen = searchParams.get("completeProfile") === "1";
    if (shouldOpen) setCompleteProfileOpen(true);
  }, [searchParams]);

  const closeCompleteProfile = () => {
    setCompleteProfileOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("completeProfile");
    router.replace(`/mentor/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const goToProfile = () => {
    setCompleteProfileOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "profile");
    params.delete("completeProfile");
    router.replace(`/mentor/dashboard?${params.toString()}`);
  };

  useMentorData(session?.user?.email ?? undefined);

  useEffect(() => {
    if (profile?.is_available !== undefined) setIsAvailable(profile.is_available);
  }, [profile?.is_available]);

  useEffect(() => {
    setHistoryPanelOpen(false);
  }, [activeTab]);

  const mentorName = profile?.display_name ?? signup?.name ?? session?.user?.name ?? "Mentor";
  const mentorEmail = signup?.email ?? session?.user?.email ?? "";
  const mentorCollege = signup?.college ?? "";
  const mentorCourse = signup?.course ?? "";
  useMentorPresence(mentorEmail || undefined, Boolean(isAvailable));

  // Helper to convert a DB row into the UI LiveRequest shape
  const rowToLiveRequest = (row: LiveRequestRow): LiveRequest => ({
    id: row.id,
    studentEmail: row.student_email,
    studentName: row.student_name,
    type: row.type as LiveRequest["type"],
    topic: row.topic ?? "",
    timeRequested: "Just now",
    image: row.student_image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rate: row.rate,
  });

  const handleAcceptLiveRequest = async (req: LiveRequest) => {
    if (!mentorEmail || !req.studentEmail) return;
    ensureCometChatUser({
      email: req.studentEmail,
      name: req.studentName,
      avatar: req.image,
    }).catch(() => null);
    const chat = await createStudentChat({
      student_email: req.studentEmail,
      mentor_email: mentorEmail,
      mentor_name: mentorName,
      mentor_avatar: profile?.avatar_url ?? null,
      chat_rate: req.rate,
      call_rate: req.rate,
    });
    if (!chat) return;
    // Mark as accepted in DB — student gets notified via postgres_changes
    await updateLiveRequestStatus(req.id, "accepted");
    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id));
    setActiveTab("messages");
    setActiveChatId(buildCometUid(req.studentEmail));
  };

  const handleDeclineLiveRequest = async (req: LiveRequest) => {
    await updateLiveRequestStatus(req.id, "declined");
    setLiveRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  // Queue of pending requests to show as dialogs, one at a time.
  // Use refs to avoid stale closures — handlers change on every render.
  const pendingQueueRef = useRef<LiveRequest[]>([]);
  const showingRequestRef = useRef(false);
  const acceptRef = useRef(handleAcceptLiveRequest);
  const declineRef = useRef(handleDeclineLiveRequest);
  acceptRef.current = handleAcceptLiveRequest;
  declineRef.current = handleDeclineLiveRequest;

  const showNextRequest = useCallback(() => {
    if (showingRequestRef.current) return;
    const next = pendingQueueRef.current.shift();
    if (!next) return;
    showingRequestRef.current = true;

    liveToast.incoming({
      title: `${next.studentName}`,
      description: `Wants to chat about ${next.topic} — ₹${next.rate}/min`,
      actions: [
        {
          label: "Decline",
          onClick: () => {
            showingRequestRef.current = false;
            declineRef.current(next);
            showNextRequest();
          },
        },
        {
          label: "Accept",
          onClick: () => {
            showingRequestRef.current = false;
            acceptRef.current(next);
          },
        },
      ],
    });
  }, []);

  const enqueueRequest = useCallback((req: LiveRequest) => {
    setLiveRequests((prev) => {
      if (prev.some((r) => r.id === req.id)) return prev;
      return [req, ...prev];
    });
    pendingQueueRef.current.push(req);
    showNextRequest();
  }, [showNextRequest]);

  // Fetch pending requests on mount (survives page refreshes) + subscribe to new ones
  useEffect(() => {
    if (!mentorEmail) return;

    // Load existing pending requests from DB
    fetchPendingLiveRequests(mentorEmail).then((rows) => {
      rows
        .filter((r) => r.type !== "session-end")
        .forEach((row) => enqueueRequest(rowToLiveRequest(row)));
    });

    // Subscribe to new INSERTs via postgres_changes (real-time)
    const { cleanup } = subscribeLiveRequests(mentorEmail, (row) => {
      enqueueRequest(rowToLiveRequest(row));
    });
    const { cleanup: cleanupSessions } = subscribeSessionStarts(mentorEmail, (payload) => {
      liveToast.incoming({
        title: `${payload.studentName} started a chat`,
        description: "Open Messages to respond.",
        actions: [
          {
            label: "Open",
            onClick: () => {
              setActiveTab("messages");
              setActiveChatId(buildCometUid(payload.studentEmail));
            },
          },
        ],
      });
    });
    const { cleanup: cleanupBookings } = subscribeSessionBookings(mentorEmail, () => {
      fetchSessions(mentorEmail);
    });
    const { cleanup: cleanupEnds } = subscribeSessionEndDb(mentorEmail, (row) => {
      liveToast.success(
        "Session Ended",
        `${row.student_name} ended the session — ${row.topic}`
      );
    });
    return () => {
      cleanup();
      cleanupSessions();
      cleanupBookings();
      cleanupEnds();
    };
  }, [mentorEmail, fetchSessions]);

  const requests: SessionRequest[] = useMemo(
    () => sessions
      .filter((s) => s.status === "requested")
      .map((s) => ({
        id: s.id,
        studentName: s.student_name,
        studentImage: s.student_image,
        date: formatDate(s.scheduled_date),
        time: formatTime12(s.scheduled_time),
        duration: `${s.duration_minutes} min`,
        earning: s.earning,
        topic: s.topic,
        requestedAt: formatRequestedAt(s.requested_at),
      })),
    [sessions]
  );

  const upcomingSessions: TodaySession[] = useMemo(() => {
    const todayKey = toDateKey(new Date());

    return sessions
      .filter((s) => s.status === "upcoming")
      .filter((s) => {
        if (!s.scheduled_date) return false;
        const sessionKey = toDateKey(new Date(s.scheduled_date));
        return sessionKey >= todayKey;
      })
      .sort((a, b) => {
        const dateComp = (a.scheduled_date ?? "").localeCompare(b.scheduled_date ?? "");
        if (dateComp !== 0) return dateComp;
        return (a.scheduled_time ?? "").localeCompare(b.scheduled_time ?? "");
      })
      .map((s) => ({
        id: s.id,
        studentEmail: s.student_email ?? null,
        studentName: s.student_name,
        studentImage: s.student_image,
        date: formatDate(s.scheduled_date),
        time: formatTime12(s.scheduled_time),
        topic: s.topic || "Mentoring",
      }));
  }, [sessions]);

  const handleAcceptSession = async (id: string) => {
    const s = sessions.find((s) => s.id === id);
    await acceptSession(id);
    if (s?.student_email) {
      sendSessionStatusUpdate(s.student_email, {
        sessionId: id,
        status: "upcoming",
        mentorName,
        topic: s.topic,
        scheduledDate: s.scheduled_date,
        scheduledTime: s.scheduled_time,
      });
    }
  };

  const handleDeclineSession = async (id: string) => {
    const s = sessions.find((s) => s.id === id);
    await declineSession(id);
    if (s?.student_email) {
      sendSessionStatusUpdate(s.student_email, {
        sessionId: id,
        status: "declined",
        mentorName,
        topic: s.topic,
        scheduledDate: s.scheduled_date,
        scheduledTime: s.scheduled_time,
      });
    }
  };

  const handleStartScheduledChat = async (sessionItem: TodaySession) => {
    if (!mentorEmail || !sessionItem.studentEmail) return;
    fetch("/api/cometchat/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sessionItem.studentEmail,
        name: sessionItem.studentName,
        avatar: sessionItem.studentImage ?? null,
      }),
    }).catch(() => null);
    const chat = await createStudentChat({
      student_email: sessionItem.studentEmail,
      mentor_email: mentorEmail,
      mentor_name: mentorName,
      mentor_avatar: profile?.avatar_url ?? null,
      chat_rate: 5,
      call_rate: 5,
    });
    if (!chat) return;
    sendSessionReady(sessionItem.studentEmail, {
      sessionId: sessionItem.id,
      mentorEmail,
      mentorName,
      topic: sessionItem.topic,
    });
    setActiveTab("messages");
    setActiveChatId(buildCometUid(sessionItem.studentEmail));
  };

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

  const isMessageDetail = activeTab === "messages" && Boolean(activeChatId);

  return (
    <div className={`min-h-screen bg-[#FFF9F5] md:bg-[#FFF9F5] ${isMessageDetail ? "pb-0" : "pb-24"} md:pb-0 font-nunito relative flex`}>
      <Dialog open={completeProfileOpen} onOpenChange={(open) => (open ? setCompleteProfileOpen(true) : closeCompleteProfile())}>
        <DialogContent className="max-w-3xl w-[calc(100%-2rem)] p-0 bg-white border border-orange-100 shadow-[0_20px_70px_rgba(0,0,0,0.12)]">

          <div className="px-8 py-8">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-[#FF7A1F] text-3xl font-black">Almost there</DialogTitle>
              <DialogDescription className="text-[#6B7280] text-base text-lg leading-relaxed max-w-2xl">
                You are not whitelisted yet. Complete your profile so you are ready when First Dollar goes live soon.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeCompleteProfile}
                className="px-5 py-2.5 rounded-lg border border-orange-200 text-[#FF7A1F] text-sm font-medium hover:bg-orange-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={goToProfile}
                className="px-5 py-2.5 rounded-lg bg-[#FF7A1F] text-white text-sm font-semibold hover:bg-[#FF6A0F] transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <MentorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => signOut({ callbackUrl: "/" })}
        onLogoClick={() => router.push("/")}
        messagesBadge={liveRequests.length}
      />

      <main className={`flex-1 md:ml-64 w-full max-w-full overflow-x-hidden ${activeTab === "messages" ? "h-screen flex flex-col" : ""}`}>
        <div className={`${activeTab === "messages" ? "h-full flex flex-col flex-1 md:p-0 md:max-w-none md:mx-0" : "md:p-8 md:max-w-6xl md:mx-auto min-h-screen"}`}>
          <div className={`${activeTab === "messages" ? "flex flex-col h-full" : "bg-white md:rounded-[32px] md:shadow-sm md:border border-orange-100 min-h-screen md:min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8"}`}>
            {!isMessageDetail && (
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
                {activeTab === "profile" && (
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
                )}
              </div>
            </div>
            )}

            {!isMessageDetail && (
              <MentorHistoryPanel
                open={historyPanelOpen}
                onClose={() => setHistoryPanelOpen(false)}
                sessions={historySessions}
              />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={
                  activeTab === "messages"
                    ? `flex-1 min-h-0 flex flex-col ${isMessageDetail ? "px-0 pb-0" : "px-4 pb-24"} md:px-0 md:pb-0`
                    : ""
                }
              >
                {activeTab === "home" && (
                  <HomeTab
                    isOnline={isOnline}
                    onToggleOnline={setIsOnline}
                    requests={requests}
                    upcomingSessions={upcomingSessions}
                    onAcceptRequest={handleAcceptSession}
                    onDeclineRequest={handleDeclineSession}
                    onStartScheduledChat={handleStartScheduledChat}
                    onCancelScheduled={handleDeclineSession}
                    onGoBoost={() => setActiveTab("boost")}
                  />
                )}
                {activeTab === "messages" && <MessagesTab activeChatId={activeChatId} onActiveChatChange={setActiveChatId} />}
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

      {!isMessageDetail && (
        <MentorMobileNav activeTab={activeTab} onTabChange={setActiveTab} messagesBadge={liveRequests.length} hidden={navHidden} />
      )}
    </div>
  );
}
