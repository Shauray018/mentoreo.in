import { create } from "zustand";
import {
  fetchStudentProfile,
  saveStudentProfileApi,
  createStudentProfileApi,
  syncStudentSignup,
  fetchStudentWallet,
  fetchStudentWalletTxs,
  fetchStudentChats,
  createStudentChat,
  fetchStudentMessages,
  fetchStudentSessions,
} from "@/services/studentApi";

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

export interface StudentSession {
  id: string;
  mentor_email: string;
  student_email: string;
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

interface StudentStore {
  profile: StudentProfile | null;
  wallet: StudentWallet | null;
  walletTxs: StudentWalletTx[];
  chats: StudentChat[];
  sessions: StudentSession[];
  messagesByChat: Record<string, StudentMessage[]>;
  loading: boolean;
  profileLoading: boolean;
  walletLoading: boolean;
  chatsLoading: boolean;
  error: string | null;

  fetchProfile: (email: string) => Promise<void>;
  saveProfile: (email: string, patch: Partial<StudentProfile>) => Promise<void>;
  fetchWallet: (email: string) => Promise<void>;
  fetchWalletTxs: (email: string) => Promise<void>;
  refreshWallet: (email: string) => Promise<void>;
  fetchSessions: (email: string) => Promise<void>;
  fetchChats: (email: string) => Promise<void>;
  createChat: (payload: {
    student_email: string;
    mentor_email: string;
    mentor_name?: string | null;
    mentor_avatar?: string | null;
    chat_rate?: number | null;
    call_rate?: number | null;
  }) => Promise<StudentChat | null>;
  fetchMessages: (chatId: string) => Promise<void>;
  applyWalletDelta: (deltaPaise: number) => void;
  clear: () => void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  profile: null,
  wallet: null,
  walletTxs: [],
  chats: [],
  sessions: [],
  messagesByChat: {},
  loading: false,
  profileLoading: false,
  walletLoading: false,
  chatsLoading: false,
  error: null,

  fetchProfile: async (email) => {
    set({ profileLoading: true });
    try {
      const profile = await fetchStudentProfile(email);
      set({ profile });
    } finally {
      set({ profileLoading: false });
    }
  },

  saveProfile: async (email, patch) => {
    // optimistic
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...patch } : ({ email, ...patch } as StudentProfile),
    }));

    try {
      const updated = await saveStudentProfileApi(email, patch);
      set({ profile: updated });
    } catch {
      await createStudentProfileApi(email, patch).catch(() => {});
    }

    await syncStudentSignup(email, patch);
  },

  fetchWallet: async (email) => {
    set({ walletLoading: true });
    try {
      const wallet = await fetchStudentWallet(email);
      if (wallet) set({ wallet });
    } finally {
      set({ walletLoading: false });
    }
  },

  fetchWalletTxs: async (email) => {
    const walletTxs = await fetchStudentWalletTxs(email);
    set({ walletTxs });
  },

  refreshWallet: async (email) => {
    await Promise.all([get().fetchWallet(email), get().fetchWalletTxs(email)]);
  },

  fetchSessions: async (email) => {
    const sessions = await fetchStudentSessions(email);
    set({ sessions });
  },

  fetchChats: async (email) => {
    set({ chatsLoading: true });
    try {
      const chats = await fetchStudentChats(email);
      set({ chats });
    } finally {
      set({ chatsLoading: false });
    }
  },

  createChat: async (payload) => {
    try {
      const chat = await createStudentChat(payload);
      set((state) => ({ chats: [chat, ...state.chats] }));
      return chat;
    } catch {
      return null;
    }
  },

  fetchMessages: async (chatId) => {
    const msgs = await fetchStudentMessages(chatId);
    set((state) => ({ messagesByChat: { ...state.messagesByChat, [chatId]: msgs } }));
  },

  applyWalletDelta: (deltaPaise) =>
    set((state) => {
      if (!state.wallet) return state;
      return {
        wallet: {
          ...state.wallet,
          balance_paise: Math.max(0, state.wallet.balance_paise + deltaPaise),
        },
      };
    }),

  clear: () => set({
    profile: null,
    wallet: null,
    walletTxs: [],
    chats: [],
    sessions: [],
    messagesByChat: {},
    profileLoading: false,
    walletLoading: false,
    chatsLoading: false,
    error: null,
  }),
}));
