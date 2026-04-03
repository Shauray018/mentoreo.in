"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import CometChatPanel from "@/components/cometchat/CometChatPanel";
import { useStudentData } from "@/hooks/useStudentData";
import { useStudentStore } from "@/store/studentStore";
import { toast } from "sonner";
import { liveToast } from "@/store/liveToastStore";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { sendSessionStart } from "@/services/liveRequests";
import { createLiveRequest, createSessionEndNotification, updateLiveRequestStatus, subscribeLiveRequestStatus } from "@/services/liveRequestsDb";
import { useEffect, useMemo, useRef, useState } from "react";

export default function StudentChatDetail() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const activeUid = typeof id === "string" ? id : undefined;
  const mentorEmail = searchParams.get("mentor") || "";
  const liveParam = searchParams.get("live") === "1";

  useStudentData(session?.user?.email ?? undefined);
  const { wallet, applyWalletDelta, chatsLoading, walletLoading, chats } = useStudentStore();
  const onlineMentors = useOnlineMentors();
  const mentorIsOnline = mentorEmail ? onlineMentors.has(mentorEmail) : false;
  const isLoading = chatsLoading || walletLoading;
  const [talkNowState, setTalkNowState] = useState<"idle" | "requesting" | "accepted">("idle");
  const [sessionStartTrigger, setSessionStartTrigger] = useState(0);
  const pendingRequestIdRef = useRef<string | null>(null);

  const activeChat = useMemo(
    () => chats.find((c) => c.mentor_email === mentorEmail),
    [chats, mentorEmail]
  );

  useEffect(() => {
    setTalkNowState("idle");
    pendingRequestIdRef.current = null;
  }, [mentorEmail]);

  useEffect(() => {
    if (!liveParam) return;
    setTalkNowState("accepted");
    setSessionStartTrigger(Date.now());
  }, [liveParam]);

  // Subscribe to live request status changes to update local chat UI state.
  // The liveToast dialog is handled globally in studentLayout.tsx.
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    const { cleanup } = subscribeLiveRequestStatus(
      email,
      (row) => {
        if (row.mentor_email !== mentorEmail) return;
        if (row.status === "accepted") {
          pendingRequestIdRef.current = null;
          setTalkNowState("accepted");
          setSessionStartTrigger(Date.now());
        } else if (row.status === "declined") {
          pendingRequestIdRef.current = null;
          setTalkNowState("idle");
        }
      },
      "chat-detail"
    );
    return () => { cleanup(); };
  }, [session?.user?.email, mentorEmail]);

  const cancelPendingRequest = () => {
    const reqId = pendingRequestIdRef.current;
    if (reqId) {
      updateLiveRequestStatus(reqId, "expired").catch(() => null);
      pendingRequestIdRef.current = null;
    }
    setTalkNowState("idle");
  };

  const handleBack = () => {
    if (talkNowState === "requesting") {
      cancelPendingRequest();
    }
    router.push("/student/chats");
  };

  const handleTalkNowRequest = async () => {
    if (!mentorEmail || !session?.user?.email) return;
    if (!mentorIsOnline) {
      liveToast.error("Mentor Offline", "Mentor is not live right now.");
      router.push(`/student/dashboard?bookMentor=${encodeURIComponent(mentorEmail)}&mode=schedule`);
      return;
    }
    if (talkNowState !== "idle") return;
    setTalkNowState("requesting");
    try {
      const row = await createLiveRequest({
        studentEmail: session.user.email,
        studentName: session.user.name ?? "Student",
        mentorEmail,
        type: "chat",
        topic: activeChat?.last_message ?? "Chat",
        rate: activeChat?.chat_rate ?? 5,
      });
      pendingRequestIdRef.current = row.id;
      liveToast.success("Request Sent!", "Waiting for mentor to accept...");
    } catch {
      setTalkNowState("idle");
      liveToast.error("Request Failed", "Failed to send request. Please try again.");
    }
  };

  return (
    <div className="bg-[#F8F9FA] h-[100dvh] overflow-hidden font-nunito px-0 pt-0 pb-0 md:p-0">
      <div className="w-full h-[100dvh] md:h-[100vh] max-w-none mx-auto bg-white overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full p-4 sm:p-6 animate-pulse flex flex-col gap-4">
            <div className="h-12 rounded-2xl bg-[#F3E8FF]" />
            <div className="flex-1 rounded-3xl bg-[#EFEAFF]" />
            <div className="h-14 rounded-2xl bg-[#F3E8FF]" />
          </div>
        ) : (
          <CometChatPanel
            activeUid={activeUid}
            onBack={handleBack}
            className="w-full h-full"
            emptyTitle="Chat not found"
            emptyHint="Go back to your inbox to pick a conversation."
            onMentorOffline={() => {
              toast.error("Mentor can't talk right now.");
              if (mentorEmail) {
                router.push(`/student/dashboard?bookMentor=${encodeURIComponent(mentorEmail)}&mode=schedule`);
              }
            }}
            onSessionStart={() => {
              if (!mentorEmail || !session?.user?.email) return;
              sendSessionStart(mentorEmail, {
                id: `session-${mentorEmail}-${session.user.email}-${Date.now()}`,
                studentEmail: session.user.email,
                studentName: session.user.name ?? "Student",
                studentImage: null,
                mode: "chat",
                createdAt: Date.now(),
              }).catch(() => null);
            }}
            onSessionEnd={(payload) => {
              if (!mentorEmail || !session?.user?.email) return;
              createSessionEndNotification({
                studentEmail: session.user.email,
                studentName: session.user.name ?? "Student",
                mentorEmail,
                minutes: payload.minutes,
                rate: payload.rate,
                total: payload.total,
              }).catch(() => null);
            }}
            statusOverride={mentorIsOnline ? "online" : "offline"}
            talkNowState={talkNowState}
            onTalkNowRequest={handleTalkNowRequest}
            sessionStartTrigger={sessionStartTrigger}
            billing={{
              enabled: true,
              showTalkNow: true,
              ratePerMin: activeChat?.chat_rate ?? 5,
              minMinutes: 10,
              balancePaise: wallet?.balance_paise ?? 0,
              onLowBalance: () => router.push("/student/wallet"),
              onBalanceDelta: (delta) => applyWalletDelta(delta),
            }}
          />
        )}
      </div>
    </div>
  );
}
