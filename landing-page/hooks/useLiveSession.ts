"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createLiveRequest,
  subscribeLiveRequestStatus,
  LiveRequestRow,
} from "@/services/liveRequestsDb";
import { ensureCometChatUser } from "@/services/cometchatApi";
import { buildCometUid } from "@/lib/cometchat-uid";
import { liveToast } from "@/store/liveToastStore";

export function useLiveSession() {
  const router = useRouter();
  const { data: session } = useSession();
  const studentEmail = session?.user?.email ?? "";

  const [sending, setSending] = useState(false);

  // Subscribe to status changes on our live requests (mentor accepted/declined)
  useEffect(() => {
    if (!studentEmail) return;
    const { cleanup } = subscribeLiveRequestStatus(studentEmail, (row: LiveRequestRow) => {
      if (row.status === "accepted") {
        const chatUrl = `/student/chats/${buildCometUid(row.mentor_email)}?mentor=${encodeURIComponent(row.mentor_email)}&live=1`;
        liveToast.incoming({
          title: "Mentor Accepted!",
          description: "Your mentor is ready to chat.",
          actions: [
            { label: "Join Now", onClick: () => router.push(chatUrl) },
          ],
        });
      } else if (row.status === "declined") {
        liveToast.error("Request Declined", "Mentor declined your request.");
      }
    });
    return () => cleanup();
  }, [studentEmail, router]);

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
        liveToast.error("Mentor Offline", "Mentor is not live right now.");
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
        liveToast.success("Request Sent!", `Waiting for ${mentor.name} to accept...`);
      } catch {
        liveToast.error("Request Failed", "Failed to send request. Please try again.");
      } finally {
        setSending(false);
      }
    },
    [session, router]
  );

  return { connectNow, sending };
}
