import { WalletTransaction, walletApi } from "@/services/api";
import { create } from "zustand";

interface WalletState {
  balance_paise: number | null;
  transactions: WalletTransaction[];
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;

  fetchBalance: (token: string) => Promise<void>;
  fetchTransactions: (token: string) => Promise<void>;
  fetchAll: (token: string) => Promise<void>;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
  balance_paise: null,
  transactions: [],
  isLoadingBalance: false,
  isLoadingTransactions: false,

  fetchBalance: async (token: string) => {
    set({ isLoadingBalance: true });
    try {
      const res = await walletApi.getBalance(token);
      set({ balance_paise: res.balance_paise });
    } catch (e: any) {
      console.error("💥 [walletStore] fetchBalance:", e.message);
    } finally {
      set({ isLoadingBalance: false });
    }
  },

  fetchTransactions: async (token: string) => {
    set({ isLoadingTransactions: true });
    try {
      const res = await walletApi.getTransactions(token);
      set({ transactions: res.transactions });
    } catch (e: any) {
      console.error("💥 [walletStore] fetchTransactions:", e.message);
    } finally {
      set({ isLoadingTransactions: false });
    }
  },

  fetchAll: async (token: string) => {
    set({ isLoadingBalance: true, isLoadingTransactions: true });
    try {
      const [balRes, txRes] = await Promise.all([
        walletApi.getBalance(token),
        walletApi.getTransactions(token),
      ]);
      set({
        balance_paise: balRes.balance_paise,
        transactions: txRes.transactions,
      });
    } catch (e: any) {
      console.error("💥 [walletStore] fetchAll:", e.message);
    } finally {
      set({ isLoadingBalance: false, isLoadingTransactions: false });
    }
  },

  reset: () =>
    set({
      balance_paise: null,
      transactions: [],
      isLoadingBalance: false,
      isLoadingTransactions: false,
    }),
}));
