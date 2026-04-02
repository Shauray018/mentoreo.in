"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  createLiveRequest,
  subscribeLiveRequestStatus,
  LiveRequestRow,
} from "@/services/liveRequestsDb";
import { ensureCometChatUser } from "@/services/cometchatApi";
import { buildCometUid } from "@/lib/cometchat-uid";

export interface LiveSessionReady {
  mentorEmail: string;
  mentorName: string;
  chatUrl: string;
}

export function useLiveSession() {
  const router = useRouter();
  const { data: session } = useSession();
  const studentEmail = session?.user?.email ?? "";

  const [sending, setSending] = useState(false);
  const [liveSessionReady, setLiveSessionReady] = useState<LiveSessionReady | null>(null);

  // Subscribe to status changes on our live requests (mentor accepted/declined)
  useEffect(() => {
    if (!studentEmail) return;
    const { cleanup } = subscribeLiveRequestStatus(studentEmail, (row: LiveRequestRow) => {
      if (row.status === "accepted") {
        const chatUrl = `/student/chats/${buildCometUid(row.mentor_email)}?mentor=${encodeURIComponent(row.mentor_email)}&live=1`;
        setLiveSessionReady({
          mentorEmail: row.mentor_email,
          mentorName: "", // will be filled by the banner from mentor data
          chatUrl,
        });
      } else if (row.status === "declined") {
        toast.error("Mentor declined your request.");
      }
    });
    return () => cleanup();
  }, [studentEmail]);

  const joinLiveSession = useCallback(() => {
    if (!liveSessionReady) return;
    const url = liveSessionReady.chatUrl;
    setLiveSessionReady(null);
    router.push(url);
  }, [liveSessionReady, router]);

  const dismissLiveSession = useCallback(() => {
    setLiveSessionReady(null);
  }, []);

  const connectNow = useCallback(
    async (mentor: {
      id: string;
      name: string;
      avatar_url?: string | null;
      course?: string | null;
      pricePerMin?: number | null;
      is_available?: boolean | null;
    }, isLive: boolean) => {
      if (!session?.user?.email) {
        router.push("/student/login");
        return;
      }
      if (!isLive) {
        toast.error("Mentor is not live right now.");
        return;
      }

      setSending(true);
      try {
        ensureCometChatUser({
          email: mentor.id,
          name: mentor.name,
          avatar: mentor.avatar_url ?? null,
        }).catch(() => null);

        await createLiveRequest({
          studentEmail: session.user.email,
          studentName: session.user.name ?? "Student",
          mentorEmail: mentor.id,
          type: "chat",
          topic: mentor.course ?? "Mentoring",
          rate: mentor.pricePerMin ?? 5,
        });
        toast.success("Request sent to mentor!");
      } catch {
        toast.error("Failed to send request. Please try again.");
      } finally {
        setSending(false);
      }
    },
    [session, router]
  );

  return { connectNow, sending, liveSessionReady, joinLiveSession, dismissLiveSession };
}
