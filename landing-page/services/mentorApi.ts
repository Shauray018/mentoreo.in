import type { MentorProfile, Review, Session, EarningRow, SignupRow } from "@/store/mentorStore";

export async function fetchSignup(email: string): Promise<SignupRow | null> {
  const res = await fetch(`/api/signups?email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : null;
}

export async function fetchMentorProfile(email: string): Promise<MentorProfile | null> {
  const res = await fetch(`/api/mentor-profiles?email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : null;
}

export async function fetchMentorSessions(email: string): Promise<Session[]> {
  const res = await fetch(`/api/sessions?mentor_email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : [];
}

export async function fetchMentorReviews(email: string): Promise<Review[]> {
  const res = await fetch(`/api/reviews?mentor_email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : [];
}

export async function fetchMentorEarnings(email: string): Promise<EarningRow[]> {
  const res = await fetch(`/api/earnings?mentor_email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : [];
}

export async function saveMentorProfile(email: string, patch: Partial<MentorProfile>): Promise<MentorProfile> {
  const res = await fetch(`/api/mentor-profiles?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function updateSessionStatus(id: string, status: Session["status"]): Promise<void> {
  const res = await fetch(`/api/sessions?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update session");
}
