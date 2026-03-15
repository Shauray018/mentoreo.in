import { create } from "zustand";

export interface StudentProfile {
  email: string;
  name?: string | null;
  phone?: string | null;
  college?: string | null;
  class_level?: string | null;
  avatar_url?: string | null;
}

export interface StudentWallet {
  student_email: string;
  balance_paise: number;
}

export interface StudentWalletTx {
  id: string;
  student_email: string;
  type: "credit" | "debit";
  source: string | null;
  amount_paise: number;
  reference_id?: string | null;
  metadata?: any;
  created_at: string;
}

export interface StudentChat {
  unread: number;
  id: string;
  student_email: string;
  mentor_email: string;
  mentor_name?: string | null;
  mentor_avatar?: string | null;
  last_message?: string | null;
  unread_count: number;
  is_online: boolean;
  chat_rate?: number | null;
  call_rate?: number | null;
  updated_at: string;
}

export interface StudentMessage {
  id: string;
  chat_id: string;
  sender: "student" | "mentor" | "system";
  body: string;
  created_at: string;
}

interface StudentStore {
  profile: StudentProfile | null;
  wallet: StudentWallet | null;
  walletTxs: StudentWalletTx[];
  chats: StudentChat[];
  messagesByChat: Record<string, StudentMessage[]>;
  loading: boolean;
  error: string | null;

  fetchProfile: (email: string) => Promise<void>;
  saveProfile: (email: string, patch: Partial<StudentProfile>) => Promise<void>;
  fetchWallet: (email: string) => Promise<void>;
  fetchWalletTxs: (email: string) => Promise<void>;
  refreshWallet: (email: string) => Promise<void>;
  fetchChats: (email: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  clear: () => void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  profile: null,
  wallet: null,
  walletTxs: [],
  chats: [],
  messagesByChat: {},
  loading: false,
  error: null,

  fetchProfile: async (email) => {
    const res = await fetch(`/api/student-profiles?email=${encodeURIComponent(email)}`);
    if (res.ok) set({ profile: await res.json() });
  },

  saveProfile: async (email, patch) => {
    // optimistic
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...patch } : ({ email, ...patch } as StudentProfile),
    }));

    const res = await fetch(`/api/student-profiles?email=${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...patch, email }),
    });

    if (!res.ok) {
      // create if missing
      await fetch("/api/student-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, email }),
      }).catch(() => {});
    } else {
      set({ profile: await res.json() });
    }

    // keep signups in sync
    await fetch(`/api/student-signups?email=${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: patch.name, phone: patch.phone }),
    }).catch(() => {});
  },

  fetchWallet: async (email) => {
    const res = await fetch(`/api/student-wallet?email=${encodeURIComponent(email)}`);
    if (res.ok) {
      set({ wallet: await res.json() });
      return;
    }
    if (res.status === 404) {
      const create = await fetch("/api/student-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (create.ok) set({ wallet: await create.json() });
    }
  },

  fetchWalletTxs: async (email) => {
    const res = await fetch(`/api/student-wallet/transactions?email=${encodeURIComponent(email)}`);
    if (res.ok) set({ walletTxs: await res.json() });
  },

  refreshWallet: async (email) => {
    await Promise.all([get().fetchWallet(email), get().fetchWalletTxs(email)]);
  },

  fetchChats: async (email) => {
    const res = await fetch(`/api/student-chats?student_email=${encodeURIComponent(email)}`);
    if (res.ok) set({ chats: await res.json() });
  },

  fetchMessages: async (chatId) => {
    const res = await fetch(`/api/student-messages?chat_id=${encodeURIComponent(chatId)}`);
    if (res.ok) {
      const msgs = await res.json();
      set((state) => ({ messagesByChat: { ...state.messagesByChat, [chatId]: msgs } }));
    }
  },

  clear: () => set({
    profile: null,
    wallet: null,
    walletTxs: [],
    chats: [],
    messagesByChat: {},
    error: null,
  }),
}));
