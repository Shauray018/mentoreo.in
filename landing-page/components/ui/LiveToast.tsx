"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLiveToastStore } from "@/store/liveToastStore";
import { Check, X, Loader2, Zap } from "lucide-react";

function SuccessIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
    >
      <motion.div
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

function ErrorIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto"
    >
      <X className="w-8 h-8 text-red-500" strokeWidth={3} />
    </motion.div>
  );
}

function WaitingIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mx-auto"
    >
      <Loader2 className="w-8 h-8 text-[#9758FF] animate-spin" />
    </motion.div>
  );
}

function IncomingIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
      className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Zap className="w-8 h-8 text-orange-500" fill="currentColor" />
      </motion.div>
    </motion.div>
  );
}

const ICONS = {
  success: SuccessIcon,
  error: ErrorIcon,
  waiting: WaitingIcon,
  incoming: IncomingIcon,
};

export default function LiveToast() {
  const { visible, variant, title, description, actions, autoDismissMs, dismiss } =
    useLiveToastStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (visible && autoDismissMs && autoDismissMs > 0) {
      timerRef.current = setTimeout(() => dismiss(), autoDismissMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, autoDismissMs, dismiss]);

  const Icon = ICONS[variant];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && autoDismissMs) dismiss();
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-full max-w-[320px] bg-white rounded-3xl shadow-2xl p-8 text-center"
          >
            <Icon />

            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-lg font-bold text-[#111827]"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              {title}
            </motion.h3>

            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm text-[#6B7280] font-medium"
              >
                {description}
              </motion.p>
            )}

            {actions && actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 flex gap-3 justify-center"
              >
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      action.onClick();
                      dismiss();
                    }}
                    className={
                      i === actions.length - 1
                        ? "px-6 py-2.5 bg-[#9758FF] hover:bg-[#8B5CF6] text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md shadow-[#9758FF]/20"
                        : "px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#111827] rounded-xl font-bold text-sm transition-all active:scale-95"
                    }
                  >
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
