import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserRole = "student" | "mentor";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  _setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,

      signIn: (user) => set({ user }),

      signOut: () => set({ user: null }),

      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "@mentoreo_auth",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
      // Only persist the user object, not derived state
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
