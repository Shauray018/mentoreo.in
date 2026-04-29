import { Session, sessionsApi } from "@/services/api";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { useWalletStore } from "./walletStore";

const POLL_INTERVAL_MS = 4000;

interface SessionState {
  // ── Data ──────────────────────────────────────────────────────────────
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // ── Poller internals (not exposed to consumers) ────────────────────────
  _pollRef: ReturnType<typeof setInterval> | null;
  _token: string | null;

  // ── Actions ───────────────────────────────────────────────────────────
  /** Call once when the user signs in or the app foregrounds */
  startPolling: (token: string) => void;

  /** Call on sign out or when no session is needed */
  stopPolling: () => void;

  /** Manually trigger a fresh fetch (e.g. after requesting a session) */
  refresh: () => Promise<void>;

  /** End session — calls API, updates state. Navigation is the caller's job. */
  endSession: (sessionId: string, token: string) => Promise<void>;

  /** Cancel pending session request */
  cancelSession: (sessionId: string, token: string) => Promise<void>;

  /** Accept session (mentor side) */
  acceptSession: (sessionId: string, token: string) => Promise<Session>;

  /** Decline session (mentor side) */
  declineSession: (sessionId: string, token: string) => Promise<void>;

  /** Reset everything (on sign out) */
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  _pollRef: null,
  _token: null,

  startPolling: (token: string) => {
    // Don't start a second poller if one is already running with the same token
    const { _pollRef, _token } = get();
    if (_pollRef && _token === token) return;

    // Clear any existing poller first
    if (_pollRef) clearInterval(_pollRef);

    console.log("[sessionStore] starting poller");

    const fetchOnce = async () => {
      try {
        const res = await sessionsApi.getActive(token);
        set({ session: res.session, error: null });
        const prevSession = get().session;

        if (
          res.session?.status === "pending" &&
          prevSession?.id !== res.session?.id
        ) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Session Request 🔔",
              body: `${res.session.student_email} wants a session with you!`,
              sound: "default",
              data: { sessionId: res.session.id },
            },
            trigger: null, // fire immediately
          });
        }
      } catch (e: any) {
        console.error("💥 [sessionStore] poll failed:", e.message);
        set({ error: e.message });
      }
    };

    // Fetch immediately, then on interval
    fetchOnce();
    const pollRef = setInterval(fetchOnce, POLL_INTERVAL_MS);
    set({ _pollRef: pollRef, _token: token });
  },

  stopPolling: () => {
    const { _pollRef } = get();
    if (_pollRef) {
      console.log("[sessionStore] stopping poller");
      clearInterval(_pollRef);
    }
    set({ _pollRef: null, _token: null });
  },

  refresh: async () => {
    const { _token } = get();
    if (!_token) return;
    try {
      const res = await sessionsApi.getActive(_token);
      set({ session: res.session, error: null });
    } catch (e: any) {
      console.error("💥 [sessionStore] refresh failed:", e.message);
    }
  },

  endSession: async (sessionId: string, token: string) => {
    set({ isLoading: true });
    try {
      const res = await sessionsApi.end(sessionId, token);
      set({ session: res.session, isLoading: false });
      // Wallet balance changed — refresh it for the student
      useWalletStore.getState().fetchBalance(token);
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  cancelSession: async (sessionId: string, token: string) => {
    set({ isLoading: true });
    try {
      await sessionsApi.cancel(sessionId, token);
      set({ session: null, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  acceptSession: async (sessionId: string, token: string) => {
    set({ isLoading: true });
    try {
      const res = await sessionsApi.accept(sessionId, token);
      set({ session: res.session, isLoading: false });
      return res.session;
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  declineSession: async (sessionId: string, token: string) => {
    set({ isLoading: true });
    try {
      await sessionsApi.decline(sessionId, token);
      set({ session: null, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false });
      throw e;
    }
  },

  reset: () => {
    const { _pollRef } = get();
    if (_pollRef) clearInterval(_pollRef);
    set({
      session: null,
      isLoading: false,
      error: null,
      _pollRef: null,
      _token: null,
    });
  },
}));
