import { create } from "zustand";

// ── Types ──
export interface SignupRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  branch: string;
}

export interface MentorProfile {
  email: string;
  display_name: string | null;
  bio: string | null;
  approach: string | null;
  upi_id: string | null;
  linkedin: string | null;
  year: string | null;
  college: string | null;
  course: string | null;
  is_available: boolean;
  avatar_url: string | null;
  availability: Record<string, boolean> | null;
}

export interface Session {
  id: string;
  mentor_email: string;
  student_name: string;
  student_image: string | null;
  topic: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  earning: number;
  status: "requested" | "upcoming" | "completed" | "declined";
  requested_at: string;
}

export interface Review {
  id: string;
  mentor_email: string;
  student_name: string;
  rating: number;
  review_text: string;
  topic: string;
  created_at: string;
}

export interface EarningRow {
  id: string;
  mentor_email: string;
  amount: number;
  month: string;
}

// ── Store shape ──
interface MentorStore {
  // Data
  signup: SignupRow | null;
  profile: MentorProfile | null;
  sessions: Session[];
  reviews: Review[];
  earnings: EarningRow[];

  // Loading / error
  loading: boolean;
  error: string | null;

  // Actions — fetch
  fetchAll: (email: string) => Promise<void>;
  fetchProfile: (email: string) => Promise<void>;
  fetchSessions: (email: string) => Promise<void>;
  fetchReviews: (email: string) => Promise<void>;
  fetchEarnings: (email: string) => Promise<void>;

  // Actions — profile
  saveProfile: (email: string, patch: Partial<MentorProfile>) => Promise<void>;

  // Actions — sessions
  acceptSession: (id: string) => Promise<void>;
  declineSession: (id: string) => Promise<void>;

  // Actions — clear
  clear: () => void;
}

// ── Store ──
export const useMentorStore = create<MentorStore>((set, get) => ({
  signup: null,
  profile: null,
  sessions: [],
  reviews: [],
  earnings: [],
  loading: false,
  error: null,

  // ── Fetch all at once ──
  fetchAll: async (email) => {
    set({ loading: true, error: null });
    try {
      const [signupRes, profileRes, sessionsRes, reviewsRes, earningsRes] = await Promise.all([
        fetch(`/api/signups?email=${encodeURIComponent(email)}`),
        fetch(`/api/mentor-profiles?email=${encodeURIComponent(email)}`),
        fetch(`/api/sessions?mentor_email=${encodeURIComponent(email)}`),
        fetch(`/api/reviews?mentor_email=${encodeURIComponent(email)}`),
        fetch(`/api/earnings?mentor_email=${encodeURIComponent(email)}`),
      ]);

      const [signup, profile, sessions, reviews, earnings] = await Promise.all([
        signupRes.ok ? signupRes.json() : null,
        profileRes.ok ? profileRes.json() : null,
        sessionsRes.ok ? sessionsRes.json() : [],
        reviewsRes.ok ? reviewsRes.json() : [],
        earningsRes.ok ? earningsRes.json() : [],
      ]);

      set({ signup, profile, sessions, reviews, earnings });
    } catch (err) {
      set({ error: "Failed to load dashboard data" });
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (email) => {
    const res = await fetch(`/api/mentor-profiles?email=${encodeURIComponent(email)}`);
    if (res.ok) set({ profile: await res.json() });
  },

  fetchSessions: async (email) => {
    const res = await fetch(`/api/sessions?mentor_email=${encodeURIComponent(email)}`);
    if (res.ok) set({ sessions: await res.json() });
  },

  fetchReviews: async (email) => {
    const res = await fetch(`/api/reviews?mentor_email=${encodeURIComponent(email)}`);
    if (res.ok) set({ reviews: await res.json() });
  },

  fetchEarnings: async (email) => {
    const res = await fetch(`/api/earnings?mentor_email=${encodeURIComponent(email)}`);
    if (res.ok) set({ earnings: await res.json() });
  },

  // ── Save profile (optimistic update) ──
  saveProfile: async (email, patch) => {
    // Optimistic update
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...patch } : ({ email, ...patch } as MentorProfile),
    }));

    const res = await fetch(`/api/mentor-profiles?email=${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      // Revert on failure
      set({ error: "Failed to save profile" });
      get().fetchProfile(email);
    } else {
      const updated = await res.json();
      set({ profile: updated });
    }
  },

  // ── Accept session (optimistic) ──
  acceptSession: async (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, status: "upcoming" } : s),
    }));
    const res = await fetch(`/api/sessions?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "upcoming" }),
    });
    if (!res.ok) {
      // Revert
      set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, status: "requested" } : s),
      }));
    }
  },

  // ── Decline session (optimistic) ──
  declineSession: async (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    }));
    const res = await fetch(`/api/sessions?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" }),
    });
    if (!res.ok) {
      // Revert — refetch to restore
      const { signup } = get();
      if (signup?.email) get().fetchSessions(signup.email);
    }
  },

  clear: () => set({
    signup: null, profile: null, sessions: [],
    reviews: [], earnings: [], error: null,
  }),
}));