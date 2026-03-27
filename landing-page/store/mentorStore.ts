import { create } from "zustand";
import {
  fetchSignup,
  fetchMentorProfile,
  fetchMentorSessions,
  fetchMentorReviews,
  fetchMentorEarnings,
  saveMentorProfile,
  updateSessionStatus,
} from "@/services/mentorApi";

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
  expertise_tags?: string[] | null;
  is_available: boolean;
  is_verified?: boolean | null;
  college_id_url?: string | null;
  verification_requested_at?: string | null;
  avatar_url: string | null;
  availability: Record<string, boolean> | null;
  updated_at?: string | null;
}

export interface Session {
  id: string;
  mentor_email: string;
  student_email?: string | null;
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
      const [signup, profile, sessions, reviews, earnings] = await Promise.all([
        fetchSignup(email),
        fetchMentorProfile(email),
        fetchMentorSessions(email),
        fetchMentorReviews(email),
        fetchMentorEarnings(email),
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
    const profile = await fetchMentorProfile(email);
    set({ profile });
  },

  fetchSessions: async (email) => {
    const sessions = await fetchMentorSessions(email);
    set({ sessions });
  },

  fetchReviews: async (email) => {
    const reviews = await fetchMentorReviews(email);
    set({ reviews });
  },

  fetchEarnings: async (email) => {
    const earnings = await fetchMentorEarnings(email);
    set({ earnings });
  },

  // ── Save profile (optimistic update) ──
  saveProfile: async (email, patch) => {
    // Optimistic update
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...patch } : ({ email, ...patch } as MentorProfile),
    }));

    try {
      const updated = await saveMentorProfile(email, patch);
      set({ profile: updated });
    } catch {
      // Revert on failure
      set({ error: "Failed to save profile" });
      get().fetchProfile(email);
    }
  },

  // ── Accept session (optimistic) ──
  acceptSession: async (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, status: "upcoming" } : s),
    }));
    try {
      await updateSessionStatus(id, "upcoming");
    } catch {
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
    try {
      await updateSessionStatus(id, "declined");
    } catch {
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
