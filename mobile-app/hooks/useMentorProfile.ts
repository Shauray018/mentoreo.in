import { MentorProfile, mentorsApi } from "@/services/api";
import type { SendbirdGroupChannel } from "@sendbird/uikit-utils";
import { useEffect, useState } from "react";

// Shared module-level cache — one instance across the entire app
const mentorCache = new Map<string, MentorProfile>();

export function getMentorEmail(channel: SendbirdGroupChannel): string | null {
  try {
    if (!channel.data || channel.data.length === 0) return null;
    const parsed = JSON.parse(channel.data);
    return parsed?.mentorEmail ?? null;
  } catch {
    return null;
  }
}

export function useMentorProfile(
  channel: SendbirdGroupChannel | null,
): MentorProfile | null {
  const mentorEmail = channel ? getMentorEmail(channel) : null;

  const [mentor, setMentor] = useState<MentorProfile | null>(
    mentorEmail ? (mentorCache.get(mentorEmail) ?? null) : null,
  );

  useEffect(() => {
    if (!mentorEmail) return;
    if (mentorCache.has(mentorEmail)) {
      setMentor(mentorCache.get(mentorEmail)!);
      return;
    }
    let cancelled = false;
    mentorsApi
      .getByEmail(mentorEmail)
      .then((profile) => {
        if (cancelled) return;
        mentorCache.set(mentorEmail, profile);
        setMentor(profile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mentorEmail]);

  return mentor;
}
