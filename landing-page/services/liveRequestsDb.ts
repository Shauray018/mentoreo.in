/**
 * Database-backed live request service.
 *
 * Replaces the old ephemeral broadcast approach (services/liveRequests.ts)
 * with persistent DB rows + Supabase postgres_changes for real-time updates.
 *
 * To revert: swap imports back to "@/services/liveRequests" in consumers.
 */

import { supabase } from "@/lib/supabase";

export type LiveRequestType = "chat" | "call" | "session-end";

export interface LiveRequestRow {
  id: string;
  student_email: string;
  student_name: string;
  student_image: string | null;
  mentor_email: string;
  type: LiveRequestType;
  topic: string;
  rate: number;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  expires_at: string;
}

// ── Student actions ──

/** Student creates a live request (persisted to DB) */
export async function createLiveRequest(params: {
  studentEmail: string;
  studentName: string;
  studentImage?: string | null;
  mentorEmail: string;
  type?: LiveRequestType;
  topic?: string;
  rate?: number;
}): Promise<LiveRequestRow> {
  const res = await fetch("/api/live-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_email: params.studentEmail,
      student_name: params.studentName,
      student_image: params.studentImage ?? null,
      mentor_email: params.mentorEmail,
      type: params.type ?? "chat",
      topic: params.topic ?? "Mentoring",
      rate: params.rate ?? 5,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to create live request");
  }
  return res.json();
}

/** Student polls their request status */
export async function getLiveRequestStatus(id: string, studentEmail: string): Promise<LiveRequestRow | null> {
  const res = await fetch(`/api/live-requests?student_email=${encodeURIComponent(studentEmail)}&id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

// ── Mentor actions ──

/** Mentor fetches all pending live requests on mount / refresh */
export async function fetchPendingLiveRequests(mentorEmail: string): Promise<LiveRequestRow[]> {
  const res = await fetch(`/api/live-requests?mentor_email=${encodeURIComponent(mentorEmail)}`);
  if (!res.ok) return [];
  return res.json();
}

/** Mentor accepts or declines a live request */
export async function updateLiveRequestStatus(id: string, status: "accepted" | "declined" | "expired"): Promise<LiveRequestRow | null> {
  const res = await fetch(`/api/live-requests?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Real-time subscriptions (postgres_changes) ──

/**
 * Mentor subscribes to new live requests targeting them.
 * Fires when a new row is INSERTed with their mentor_email.
 */
export function subscribeLiveRequests(
  mentorEmail: string,
  onNew: (row: LiveRequestRow) => void
) {
  const channel = supabase
    .channel(`db-live-requests:${mentorEmail}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "live_requests",
        filter: `mentor_email=eq.${mentorEmail}`,
      },
      (payload) => {
        const row = payload.new as LiveRequestRow;
        if (row.status === "pending" && row.type !== "session-end") onNew(row);
      }
    )
    .subscribe();

  return { channel, cleanup: () => { supabase.removeChannel(channel); } };
}

/**
 * Student subscribes to status changes on their live request.
 * Fires when the mentor updates status to accepted/declined.
 */
export function subscribeLiveRequestStatus(
  studentEmail: string,
  onUpdate: (row: LiveRequestRow) => void,
  /** Unique suffix to avoid channel name collisions when multiple components subscribe */
  channelSuffix?: string
) {
  const suffix = channelSuffix ?? Math.random().toString(36).slice(2, 6);
  const channel = supabase
    .channel(`db-live-request-status:${studentEmail}:${suffix}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "live_requests",
        filter: `student_email=eq.${studentEmail}`,
      },
      (payload) => {
        onUpdate(payload.new as LiveRequestRow);
      }
    )
    .subscribe();

  return { channel, cleanup: () => { supabase.removeChannel(channel); } };
}

// ── Session end notifications (DB-backed, replaces broadcast) ──

/** Student notifies mentor that session ended by inserting a row with type='session-end' */
export async function createSessionEndNotification(params: {
  studentEmail: string;
  studentName: string;
  mentorEmail: string;
  minutes: number;
  rate: number;
  total: number;
}): Promise<void> {
  await fetch("/api/live-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_email: params.studentEmail,
      student_name: params.studentName,
      mentor_email: params.mentorEmail,
      type: "session-end",
      topic: `${params.minutes} min — ₹${params.total}`,
      rate: params.rate,
      status: "session-end",
    }),
  });
}

/** Mentor subscribes to session-end notifications */
export function subscribeSessionEndDb(
  mentorEmail: string,
  onEnd: (row: LiveRequestRow) => void
) {
  const channel = supabase
    .channel(`db-session-ends:${mentorEmail}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "live_requests",
        filter: `mentor_email=eq.${mentorEmail}`,
      },
      (payload) => {
        const row = payload.new as LiveRequestRow;
        if (row.type === "session-end") onEnd(row);
      }
    )
    .subscribe();

  return { channel, cleanup: () => { supabase.removeChannel(channel); } };
}
