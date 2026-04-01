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

export function sendLiveRequest(mentorEmail: string, payload: LiveRequestPayload) {
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "request", payload });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`live-response:${studentEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "accept", payload });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "session-start", payload });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`session-bookings:${mentorEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "new-booking", payload: { mentorEmail } });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`session-updates:${studentEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "status-update", payload });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`session-updates:${studentEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "session-ready", payload });
      supabase.removeChannel(channel);
    }
  });
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
  const channel = supabase.channel(`live-requests:${mentorEmail}`);
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.send({ type: "broadcast", event: "session-end", payload });
      supabase.removeChannel(channel);
    }
  });
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
