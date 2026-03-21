import { useEffect } from "react";
import { joinMentorPresence } from "@/services/mentorPresence";

export function useMentorPresence(email?: string, enabled?: boolean) {
  useEffect(() => {
    if (!email || !enabled) return;
    const { cleanup } = joinMentorPresence(email);
    return () => cleanup();
  }, [email, enabled]);
}
