"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createLiveRequest } from "@/services/liveRequestsDb";
import { ensureCometChatUser } from "@/services/cometchatApi";
import { liveToast } from "@/store/liveToastStore";

/**
 * Hook for sending live connect requests.
 * The accept/decline subscription is handled globally in studentLayout.tsx
 * so it works across all student pages.
 */
export function useLiveSession() {
  const router = useRouter();
  const { data: session } = useSession();

  const [sending, setSending] = useState(false);

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
