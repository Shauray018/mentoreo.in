import { useEffect, useRef } from "react";
import type { SignalPayload } from "@/services/webrtcSignaling";
import { createCallChannel } from "@/services/webrtcSignaling";

export function useCallSignaling(chatId: string | null, onSignal: (payload: SignalPayload) => void) {
  const sendRef = useRef<(payload: SignalPayload) => void>(() => undefined);

  useEffect(() => {
    if (!chatId) return;
    const { sendSignal, cleanup } = createCallChannel(chatId, onSignal);
    sendRef.current = sendSignal;
    return () => cleanup();
  }, [chatId, onSignal]);

  return (payload: SignalPayload) => sendRef.current(payload);
}
