const API_URL = process.env.API_URL || "https://mentoreo-in.onrender.com";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  let data: any;

  try {
    res = await fetch(`${API_URL}${path}`, { ...rest, headers });
    data = await res.json();
  } catch (e) {
    console.error(`💥 [API] ${method} ${path}`, e);
    throw e;
  }

  if (!res.ok) {
    console.error(`💥 [API] ${method} ${path} → ${res.status}`, data);
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (email: string, role: "student" | "mentor") =>
    request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  verifyOtp: (
    email: string,
    otp: string,
    role: "student" | "mentor",
  ): Promise<{
    token: string;
    user: { id: string; email: string; name: string; role: string };
  }> =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, role }),
    }),
};

// ─── Mentors ───────────────────────────────────────────────────────────────
export interface MentorProfile {
  email: string;
  display_name: string;
  bio: string;
  approach: string;
  tier: "bronze" | "silver" | "gold";
  rate_per_minute: number; // rupees
  is_available: boolean;
  is_verified: boolean;
  expertise_tags: string[];
  college: string;
  course: string;
  year: string;
  avatar_url: string | null;
  linkedin: string | null;
}

const normalizeMentor = (m: any): MentorProfile => ({
  email: m.email,
  display_name: m.displayName,
  bio: m.bio || "",
  approach: m.approach || "",
  tier: m.tier,
  rate_per_minute: m.ratePerMinuteRupees,
  is_available: m.isAvailable,
  is_verified: true,
  expertise_tags: m.expertiseTags || [],
  college: m.college,
  course: m.course,
  year: m.year,
  avatar_url: m.avatarUrl,
  linkedin: null,
});

export const mentorsApi = {
  list: async (): Promise<MentorProfile[]> => {
    const res = await request<{ mentors: any[] }>("/mentors");
    return (res.mentors ?? []).map(normalizeMentor);
  },

  getByEmail: async (email: string): Promise<MentorProfile> => {
    const res = await request<{ mentor: any }>(
      `/mentors/${encodeURIComponent(email)}`,
    );
    return normalizeMentor(res.mentor);
  },
};

// ─── Sessions ──────────────────────────────────────────────────────────────
export interface Session {
  id: string;
  student_id: string;
  student_email: string;
  mentor_email: string;
  rate_per_minute_paise: number;
  mentor_tier: string;
  status:
    | "pending"
    | "active"
    | "completed"
    | "declined"
    | "expired"
    | "cancelled";
  requested_at: string;
  expires_at: string;
  accepted_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  total_amount_paise: number | null;
  sendbird_channel_url: string | null;
  ended_by: string | null;
}

export const sessionsApi = {
  request: (
    mentor_email: string,
    token: string,
  ): Promise<{ session: Session }> =>
    request("/sessions/request", {
      method: "POST",
      body: JSON.stringify({ mentorEmail: mentor_email }),
      token,
    }),

  accept: (session_id: string, token: string): Promise<{ session: Session }> =>
    request("/sessions/accept", {
      method: "POST",
      body: JSON.stringify({ sessionId: session_id }),
      token,
    }),

  decline: (session_id: string, token: string): Promise<void> =>
    request("/sessions/decline", {
      method: "POST",
      body: JSON.stringify({ sessionId: session_id }),
      token,
    }),

  cancel: (session_id: string, token: string): Promise<void> =>
    request("/sessions/cancel", {
      method: "POST",
      body: JSON.stringify({ sessionId: session_id }),
      token,
    }),

  end: (session_id: string, token: string): Promise<{ session: Session }> =>
    request("/sessions/end", {
      method: "POST",
      body: JSON.stringify({ sessionId: session_id }),
      token,
    }),

  getActive: (token: string): Promise<{ session: Session | null }> =>
    request("/sessions/active", { token }),

  getHistory: (token: string): Promise<{ sessions: Session[] }> =>
    request("/sessions/history", { token }),
};

// ─── Wallet ────────────────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string;
  student_email: string;
  amount_paise: number;
  type: "session_debit" | "topup";
  reference_id: string;
  description: string;
  balance_after_paise: number;
  created_at: string;
}

export const walletApi = {
  getBalance: (token: string): Promise<{ balance_paise: number }> =>
    request("/wallet/balance", { token }),

  getTransactions: (
    token: string,
  ): Promise<{ transactions: WalletTransaction[] }> =>
    request("/wallet/transactions", { token }),
};

// ─── Helpers ───────────────────────────────────────────────────────────────
export const formatPaise = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export const tierColor = (tier: string) => {
  switch (tier) {
    case "gold":
      return "#F4B942";
    case "silver":
      return "#A8B2BB";
    case "bronze":
      return "#CD7F32";
    default:
      return "#888";
  }
};
