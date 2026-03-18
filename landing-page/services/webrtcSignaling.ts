import { supabase } from "@/lib/supabase";

export type CallType = "call" | "video";
export type SignalType =
  | "call-request"
  | "call-accept"
  | "call-decline"
  | "offer"
  | "answer"
  | "ice"
  | "hangup";

export interface SignalPayload {
  type: SignalType;
  chatId: string;
  fromRole: "student" | "mentor";
  fromId?: string;
  callType?: CallType;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp?: number;
}

export function createCallChannel(chatId: string, onSignal: (payload: SignalPayload) => void) {
  const channel = supabase.channel(`call:${chatId}`);

  channel.on("broadcast", { event: "signal" }, ({ payload }) => {
    onSignal(payload as SignalPayload);
  });

  channel.subscribe();

  const sendSignal = (payload: SignalPayload) =>
    channel.send({ type: "broadcast", event: "signal", payload });

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, sendSignal, cleanup };
}
