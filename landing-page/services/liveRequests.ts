import { supabase } from "@/lib/supabase";

export type LiveRequestType = "chat" | "call";

export interface LiveRequestPayload {
  id: string;
  studentEmail: string;
  studentName: string;
  studentImage: string | null;
  type: LiveRequestType;
  topic: string;
  rate: number;
  createdAt: number;
}

/**
 * Reliably send a one-shot broadcast on a Supabase Realtime channel.
 * Waits for SUBSCRIBED, sends the message, then tears down after a flush delay.
 */
async function broadcastOnce(
  channelName: string,
  event: string,
  payload: unknown,
  timeoutMs = 5000
): Promise<void> {
  // Supabase JS reuses channel instances by name. If a channel with this
  // name already exists on this client (e.g. from a subscriber), we must
  // use a different name for the ephemeral sender channel. We always add
  // a unique suffix — broadcast delivery is based on the channel *topic*
  // on the server, not the local JS name, so receivers still get it.
  const senderName = `${channelName}:${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const channel = supabase.channel(senderName);

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      supabase.removeChannel(channel);
      reject(new Error("Broadcast timed out"));
    }, timeoutMs);

    channel.subscribe((status) => {
      if (settled) return;

      if (status === "SUBSCRIBED") {
        settled = true;
        channel.send({ type: "broadcast", event, payload });
        clearTimeout(timer);
        setTimeout(() => {
          supabase.removeChannel(channel);
          resolve();
        }, 500);
      } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
        settled = true;
        clearTimeout(timer);
        supabase.removeChannel(channel);
        reject(new Error(`Channel ${status}`));
      }
    });
  });
}

export function sendLiveRequest(mentorEmail: string, payload: LiveRequestPayload) {
  return broadcastOnce(`live-requests:${mentorEmail}`, "request", payload);
}

export function subscribeLiveRequests(
  mentorEmail: string,
  onRequest: (payload: LiveRequestPayload) => void
) {
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.on("broadcast", { event: "request" }, ({ payload }) => {
    onRequest(payload as LiveRequestPayload);
  });
  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}

export interface LiveResponsePayload {
  chatId: string;
  mentorEmail: string;
  mentorName: string;
  mode: LiveRequestType;
}

export interface SessionStartPayload {
  id: string;
  studentEmail: string;
  studentName: string;
  studentImage: string | null;
  mode: LiveRequestType;
  createdAt: number;
}

export interface SessionEndPayload {
  id: string;
  studentEmail: string;
  studentName: string;
  studentImage: string | null;
  mentorEmail: string;
  minutes: number;
  rate: number;
  total: number;
  createdAt: number;
}

export function sendLiveResponse(studentEmail: string, payload: LiveResponsePayload) {
  return broadcastOnce(`live-response:${studentEmail}`, "accept", payload);
}

export function subscribeLiveResponses(
  studentEmail: string,
  onAccept: (payload: LiveResponsePayload) => void
) {
  const channel = supabase.channel(`live-response:${studentEmail}`);
  channel.on("broadcast", { event: "accept" }, ({ payload }) => {
    onAccept(payload as LiveResponsePayload);
  });
  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}

export function sendSessionStart(mentorEmail: string, payload: SessionStartPayload) {
  return broadcastOnce(`live-requests:${mentorEmail}`, "session-start", payload);
}

export function subscribeSessionStarts(
  mentorEmail: string,
  onStart: (payload: SessionStartPayload) => void
) {
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.on("broadcast", { event: "session-start" }, ({ payload }) => {
    onStart(payload as SessionStartPayload);
  });
  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}

export interface SessionBookingPayload {
  mentorEmail: string;
}

export function sendSessionBooking(mentorEmail: string) {
  return broadcastOnce(`session-bookings:${mentorEmail}`, "new-booking", { mentorEmail });
}

export function subscribeSessionBookings(
  mentorEmail: string,
  onBooking: () => void
) {
  const channel = supabase.channel(`session-bookings:${mentorEmail}`);
  channel.on("broadcast", { event: "new-booking" }, () => {
    onBooking();
  });
  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}

// ── Student-facing session notifications ──

export interface SessionStatusPayload {
  sessionId: string;
  status: "upcoming" | "declined";
  mentorName: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
}

/** Mentor calls this when accepting/declining a session request */
export function sendSessionStatusUpdate(studentEmail: string, payload: SessionStatusPayload) {
  return broadcastOnce(`session-updates:${studentEmail}`, "status-update", payload);
}

/** Student subscribes to accept/decline notifications */
export function subscribeSessionStatusUpdates(
  studentEmail: string,
  onUpdate: (payload: SessionStatusPayload) => void
) {
  const channel = supabase.channel(`session-updates:${studentEmail}`);
  channel.on("broadcast", { event: "status-update" }, ({ payload }) => {
    onUpdate(payload as SessionStatusPayload);
  });
  channel.subscribe();
  return { channel, cleanup: () => supabase.removeChannel(channel) };
}

export interface SessionReadyPayload {
  sessionId: string;
  mentorEmail: string;
  mentorName: string;
  topic: string;
}

/** Mentor calls this when clicking "Continue to Chat" */
export function sendSessionReady(studentEmail: string, payload: SessionReadyPayload) {
  return broadcastOnce(`session-updates:${studentEmail}`, "session-ready", payload);
}

/** Student subscribes to "mentor is ready" notifications */
export function subscribeSessionReady(
  studentEmail: string,
  onReady: (payload: SessionReadyPayload) => void
) {
  const channel = supabase.channel(`session-updates:${studentEmail}`);
  channel.on("broadcast", { event: "session-ready" }, ({ payload }) => {
    onReady(payload as SessionReadyPayload);
  });
  channel.subscribe();
  return { channel, cleanup: () => supabase.removeChannel(channel) };
}

export function sendSessionEnd(mentorEmail: string, payload: SessionEndPayload) {
  return broadcastOnce(`live-requests:${mentorEmail}`, "session-end", payload);
}

export function subscribeSessionEnds(
  mentorEmail: string,
  onEnd: (payload: SessionEndPayload) => void
) {
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.on("broadcast", { event: "session-end" }, ({ payload }) => {
    onEnd(payload as SessionEndPayload);
  });
  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}
