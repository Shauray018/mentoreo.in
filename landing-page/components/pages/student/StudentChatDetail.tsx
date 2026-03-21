"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import CometChatPanel from "@/components/cometchat/CometChatPanel";
import { useStudentData } from "@/hooks/useStudentData";
import { useStudentStore } from "@/store/studentStore";
import { toast } from "sonner";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { sendSessionStart } from "@/services/liveRequests";

export default function StudentChatDetail() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const activeUid = typeof id === "string" ? id : undefined;
  const mentorEmail = searchParams.get("mentor") || "";

  useStudentData(session?.user?.email ?? undefined);
  const { wallet, applyWalletDelta } = useStudentStore();
  const onlineMentors = useOnlineMentors();
  const mentorIsOnline = mentorEmail ? onlineMentors.has(mentorEmail) : false;

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-nunito p-4 md:p-6">
      <div className="w-full h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] max-w-5xl mx-auto bg-white rounded-[28px] shadow-sm border border-[#F3E8FF] overflow-hidden">
        <CometChatPanel
          activeUid={activeUid}
          onBack={() => router.push("/student/chats")}
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
            });
          }}
          statusOverride={mentorIsOnline ? "online" : "offline"}
          billing={{
            enabled: true,
            showTalkNow: true,
            ratePerMin: 5,
            minMinutes: 10,
            balancePaise: wallet?.balance_paise ?? 0,
            onLowBalance: () => router.push("/student/wallet"),
            onBalanceDelta: (delta) => applyWalletDelta(delta),
          }}
        />
      </div>
    </div>
  );
}
