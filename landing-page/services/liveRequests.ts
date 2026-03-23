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
