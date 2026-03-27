import { create } from "zustand";

export type MentorBrowse = {
  avatar_url: null;
  course: string;
  id: string;
  name: string;
  college: string;
  collegeType?: string | null;
  exam?: string | null;
  image?: string | null;
  rating?: number | null;
  reviews?: number | null;
  pricePerMin?: number | null;
  tags?: string[];
  is_available?: boolean;
  completion?: number;
  availability?: Record<string, boolean> | null;
  is_verified?: boolean | null;
};

interface MentorBrowseStore {
  mentors: MentorBrowse[];
  loading: boolean;
  error: string | null;
  fetchMentors: () => Promise<void>;
}

export const useMentorBrowseStore = create<MentorBrowseStore>((set, get) => ({
  mentors: [],
  loading: false,
  error: null,

  fetchMentors: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/mentors");
      if (!res.ok) throw new Error("Failed to load mentors");
      const data = await res.json();
      set({ mentors: Array.isArray(data) ? data : [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load mentors" });
    } finally {
      set({ loading: false });
    }
  },
}));
