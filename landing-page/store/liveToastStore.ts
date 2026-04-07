import { create } from "zustand";

export type LiveToastVariant = "success" | "error" | "incoming" | "waiting";

export interface LiveToastAction {
  label: string;
  onClick: () => void;
}

export interface LiveToastState {
  visible: boolean;
  variant: LiveToastVariant;
  title: string;
  description?: string;
  actions?: LiveToastAction[];
  autoDismissMs?: number | null;
  meta?: Record<string, unknown>;
}

interface LiveToastStore extends LiveToastState {
  show: (toast: Omit<LiveToastState, "visible">) => void;
  dismiss: () => void;
}

export const useLiveToastStore = create<LiveToastStore>((set) => ({
  visible: false,
  variant: "success",
  title: "",
  description: undefined,
  actions: undefined,
  autoDismissMs: null,
  meta: undefined,

  show: (toast) => set({ actions: undefined, meta: undefined, autoDismissMs: null, description: undefined, ...toast, visible: true }),
  dismiss: () => set({ visible: false }),
}));

/** Imperative API — call from anywhere without hooks */
export const liveToast = {
  success: (title: string, description?: string, durationMs = 2500) => {
    useLiveToastStore.getState().show({
      variant: "success",
      title,
      description,
      autoDismissMs: durationMs,
    });
  },

  error: (title: string, description?: string, durationMs = 3000) => {
    useLiveToastStore.getState().show({
      variant: "error",
      title,
      description,
      autoDismissMs: durationMs,
    });
  },

  waiting: (title: string, description?: string) => {
    useLiveToastStore.getState().show({
      variant: "waiting",
      title,
      description,
      autoDismissMs: null,
    });
  },

  incoming: (opts: {
    title: string;
    description?: string;
    actions: LiveToastAction[];
    meta?: Record<string, unknown>;
  }) => {
    useLiveToastStore.getState().show({
      variant: "incoming",
      title: opts.title,
      description: opts.description,
      actions: opts.actions,
      autoDismissMs: null,
      meta: opts.meta,
    });
  },

  dismiss: () => {
    useLiveToastStore.getState().dismiss();
  },
};
