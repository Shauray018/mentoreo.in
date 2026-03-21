"use client";

import { useEffect, useState } from "react";
import { initCometChat, ensureCometChatLogin } from "@/lib/cometchat-client";

interface CometChatAuthState {
  ready: boolean;
  error: string | null;
  uid: string | null;
}

export function useCometChatAuth(params: {
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
}) {
  const { email, name, avatar } = params;
  const [state, setState] = useState<CometChatAuthState>({
    ready: false,
    error: null,
    uid: null,
  });

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!email) return;
      try {
        await initCometChat();
        const res = await fetch("/api/cometchat/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, avatar }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to get CometChat token");
        }
        const data = await res.json();
        await ensureCometChatLogin(data.authToken);
        if (active) setState({ ready: true, error: null, uid: data.uid });
      } catch (error) {
        if (active) {
          setState({
            ready: false,
            error: error instanceof Error ? error.message : "CometChat init failed",
            uid: null,
          });
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [email, name, avatar]);

  return state;
}
