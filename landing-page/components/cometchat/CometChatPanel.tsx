"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Paperclip, Send, Timer } from "lucide-react";
import { motion } from "motion/react";
import { useCometChatAuth } from "@/hooks/useCometChatAuth";
import { getCometChatSDK } from "@/lib/cometchat-sdk";

interface BillingConfig {
  enabled?: boolean;
  showTalkNow?: boolean;
  ratePerMin: number;
  minMinutes: number;
  balancePaise?: number | null;
  onLowBalance?: () => void;
  onBalanceDelta?: (deltaPaise: number) => void;
}

interface CometChatPanelProps {
  activeUid?: string;
  className?: string;
  chatId?: string;
  onBack?: () => void;
  emptyTitle?: string;
  emptyHint?: string;
  onMentorOffline?: () => void;
  statusOverride?: "online" | "offline";
  onSessionStart?: () => void;
  onSessionEnd?: (payload: { minutes: number; rate: number; total: number }) => void;
  talkNowState?: "idle" | "requesting" | "accepted";
  onTalkNowRequest?: () => void;
  sessionStartTrigger?: number;
  summaryOverlay?: {
    show: boolean;
    title: string;
    lines: string[];
    onClose?: () => void;
  };
  billing?: BillingConfig;
}

interface ThreadMessage {
  id: string;
  senderUid: string;
  text: string;
  time: string;
  isMe: boolean;
}

const fallbackAvatar =
  "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function formatSeconds(total: number) {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function CometChatPanel({
  activeUid,
  className,
  chatId,
  onBack,
  emptyTitle = "Select a chat",
  emptyHint = "Pick a conversation to start messaging.",
  onMentorOffline,
  statusOverride,
  onSessionStart,
  onSessionEnd,
  talkNowState = "idle",
  onTalkNowRequest,
  sessionStartTrigger,
  summaryOverlay,
  billing,
}: CometChatPanelProps) {
  const { data: session } = useSession();
  const { ready, error } = useCometChatAuth({
    email: session?.user?.email,
    name: session?.user?.name,
    avatar: session?.user?.image,
  });

  const [targetUser, setTargetUser] = useState<any>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const listenerIdRef = useRef(`cc_listener_${Math.random().toString(36).slice(2)}`);

  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState(0);
  const [lastHiddenAt, setLastHiddenAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [debitedMinutes, setDebitedMinutes] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const sessionNotifiedRef = useRef(false);
  const sessionEndNotifiedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [currentBalancePaise, setCurrentBalancePaise] = useState(billing?.balancePaise ?? 0);
  const lastStartTriggerRef = useRef<number | null>(null);

  const updateChatPreview = useCallback(async (text: string) => {
    if (!chatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    await fetch(`/api/student-chats?id=${encodeURIComponent(chatId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        last_message: trimmed,
        updated_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [chatId]);

  useEffect(() => {
    if (billing?.balancePaise != null) setCurrentBalancePaise(billing.balancePaise);
  }, [billing?.balancePaise]);

  useEffect(() => {
    setSessionStartedAt(null);
    setPausedMs(0);
    setLastHiddenAt(null);
    setDebitedMinutes(0);
    setShowSummary(false);
    sessionNotifiedRef.current = false;
    sessionEndNotifiedRef.current = false;
  }, [activeUid]);

  const header = useMemo(() => {
    const name = targetUser?.getName?.() ?? targetUser?.name ?? "Mentor";
    const avatar = targetUser?.getAvatar?.() ?? targetUser?.avatar ?? fallbackAvatar;
    const statusRaw = targetUser?.getStatus?.() ?? targetUser?.status ?? "offline";
    const status = statusOverride ?? (statusRaw === "online" ? "online" : "offline");
    return { name, avatar, status };
  }, [targetUser, statusOverride]);
  const billingEnabled = Boolean(billing?.enabled);
  const showTalkNow = (billing?.showTalkNow ?? billingEnabled) && talkNowState !== "accepted";
  const ratePerMin = billing?.ratePerMin ?? 5;
  const minMinutes = billing?.minMinutes ?? 10;
  const balanceRupees = currentBalancePaise / 100;
  const minRequired = ratePerMin * minMinutes;
  const canStart = !billingEnabled || balanceRupees >= minRequired;
  const maxSeconds = Math.floor((balanceRupees / ratePerMin) * 60);
  const activeSeconds = sessionStartedAt
    ? Math.max(0, Math.floor((Date.now() - sessionStartedAt - pausedMs) / 1000))
    : 0;
  const remainingSeconds = Math.max(0, maxSeconds - activeSeconds);
  const timeExpired = billingEnabled && sessionStartedAt != null && remainingSeconds <= 0;

  useEffect(() => {
    if (!sessionStartTrigger) return;
    if (lastStartTriggerRef.current === sessionStartTrigger) return;
    lastStartTriggerRef.current = sessionStartTrigger;
    if (talkNowState !== "accepted") return;
    if (billingEnabled && !canStart) {
      billing?.onLowBalance?.();
      return;
    }
    if (header.status !== "online") {
      onMentorOffline?.();
      return;
    }
    startTimerIfNeeded();
  }, [sessionStartTrigger, talkNowState, billingEnabled, canStart, header.status, onMentorOffline]);

  useEffect(() => {
    const onVis = () => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!sessionStartedAt || showSummary) return;
    if (!isVisible) {
      if (!lastHiddenAt) setLastHiddenAt(Date.now());
      return;
    }
    if (lastHiddenAt) {
      setPausedMs((prev) => prev + (Date.now() - lastHiddenAt));
      setLastHiddenAt(null);
    }
  }, [sessionStartedAt, isVisible, lastHiddenAt, showSummary]);

  useEffect(() => {
    if (!sessionStartedAt || showSummary) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [sessionStartedAt, showSummary]);

  const startTimerIfNeeded = () => {
    if (!billingEnabled) return;
    if (!canStart) return;
    if (sessionStartedAt) return;
    setSessionStartedAt(Date.now());
    setPausedMs(0);
    setLastHiddenAt(null);
    setDebitedMinutes(0);
    if (!sessionNotifiedRef.current) {
      sessionNotifiedRef.current = true;
      onSessionStart?.();
    }
  };

  const formatMessage = (msg: any, currentUid?: string | null): ThreadMessage | null => {
    if (!msg || !msg.id) return null;
    const senderUid = msg.getSender?.().getUid?.() ?? msg.sender?.uid ?? "";
    const text = msg.getText?.() ?? msg.text ?? "";
    const sentAt = msg.getSentAt?.() ?? msg.sentAt ?? Date.now() / 1000;
    const time = new Date(sentAt * 1000).toLocaleTimeString();
    const isMe = currentUid ? senderUid === currentUid : false;
    return {
      id: String(msg.id),
      senderUid,
      text,
      time,
      isMe,
    };
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!ready || !activeUid) return;
      setLoadingThread(true);
      try {
        const { CometChat } = await getCometChatSDK();
        const [user, me] = await Promise.all([
          CometChat.getUser(activeUid),
          CometChat.getLoggedinUser(),
        ]);
        if (!active) return;
        setTargetUser(user);

        const req = new CometChat.MessagesRequestBuilder()
          .setUID(activeUid)
          .setLimit(50)
          .build();
        const fetched = await req.fetchPrevious();
        const currentUid = me?.getUid?.() ?? me?.uid ?? null;
        const formatted = fetched
          .map((m: any) => formatMessage(m, currentUid))
          .filter(Boolean) as ThreadMessage[];
        if (active) setMessages(formatted);
      } catch {
        if (active) setMessages([]);
      } finally {
        if (active) setLoadingThread(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [ready, activeUid]);

  useEffect(() => {
    if (!ready || !activeUid) return;

    const run = async () => {
      const { CometChat } = await getCometChatSDK();
      const listenerId = listenerIdRef.current;
      const listener = new CometChat.MessageListener({
        onTextMessageReceived: async (msg: any) => {
          const me = await CometChat.getLoggedinUser();
          const currentUid = me?.getUid?.() ?? me?.uid ?? null;
          const formatted = formatMessage(msg, currentUid);
          if (!formatted) return;
          if (formatted.senderUid !== activeUid && !formatted.isMe) return;
          updateChatPreview(formatted.text);
          startTimerIfNeeded();
          setMessages((prev) => {
            if (prev.some((m) => m.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        },
      });

      CometChat.addMessageListener(listenerId, listener);
    };

    run();
    return () => {
      getCometChatSDK().then(({ CometChat }) => {
        CometChat.removeMessageListener(listenerIdRef.current);
      }).catch(() => null);
    };
  }, [ready, activeUid, billingEnabled, canStart, sessionStartedAt]);

  useEffect(() => {
    if (!billingEnabled || showSummary || timeExpired) return;
    const studentEmail = session?.user?.email;
    if (!sessionStartedAt || !activeUid || !studentEmail) return;
    const minutes = Math.floor(activeSeconds / 60);
    if (minutes <= debitedMinutes) return;

    const run = async () => {
      for (let m = debitedMinutes + 1; m <= minutes; m += 1) {
        const amountPaise = ratePerMin * 100;
        const referenceId = `chat:${activeUid}:${sessionStartedAt}:m${m}`;
        const res = await fetch("/api/student-wallet/debit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_email: studentEmail,
            amount_paise: amountPaise,
            reference_id: referenceId,
            metadata: {
              chat_uid: activeUid,
              minute: m,
              started_at: sessionStartedAt,
              rate_per_min: ratePerMin,
            },
          }),
        });

        if (res.status === 402) {
          setShowSummary(true);
          return;
        }

        if (res.ok) {
          setDebitedMinutes((prev) => Math.max(prev, m));
          setCurrentBalancePaise((prev) => Math.max(0, prev - amountPaise));
          billing?.onBalanceDelta?.(-amountPaise);
        }
      }
    };

    run();
  }, [billingEnabled, activeSeconds, debitedMinutes, activeUid, sessionStartedAt, ratePerMin, session?.user?.email, showSummary, timeExpired]);

  useEffect(() => {
    if (timeExpired && billingEnabled) setShowSummary(true);
  }, [timeExpired, billingEnabled]);

  useEffect(() => {
    if (!billingEnabled) return;
    if (!showSummary) return;
    if (sessionEndNotifiedRef.current) return;
    sessionEndNotifiedRef.current = true;
    const total = debitedMinutes * ratePerMin;
    onSessionEnd?.({ minutes: debitedMinutes, rate: ratePerMin, total });
  }, [billingEnabled, showSummary, debitedMinutes, ratePerMin, onSessionEnd]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, sessionStartedAt]);

  const sendMessage = async () => {
    if (!activeUid) return;
    if (billingEnabled && !canStart) {
      billing?.onLowBalance?.();
      return;
    }
    if (timeExpired) return;
    const text = inputText.trim();
    if (!text) return;
    setInputText("");

    const { CometChat } = await getCometChatSDK();
    const me = await CometChat.getLoggedinUser();
    const currentUid = me?.getUid?.() ?? me?.uid ?? "";

    const optimistic: ThreadMessage = {
      id: `local-${Date.now()}`,
      senderUid: currentUid,
      text,
      time: "Just now",
      isMe: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    startTimerIfNeeded();
    updateChatPreview(text);

    const message = new CometChat.TextMessage(
      activeUid,
      text,
      CometChat.RECEIVER_TYPE.USER
    );
    try {
      const sent = await CometChat.sendMessage(message);
      const formatted = formatMessage(sent, currentUid);
      if (formatted) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? formatted : m)));
      }
    } catch {
      // Keep optimistic for now.
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (!activeUid) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center px-6">
        <div>
          <h2 className="text-lg font-bold text-[#111827] mb-1">{emptyTitle}</h2>
          <p className="text-sm text-gray-500">{emptyHint}</p>
        </div>
      </div>
    );
  }

  if (!ready || loadingThread) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className={className ?? "w-full h-full"}>
      <div className="flex flex-col h-full min-h-0">
        <div className="bg-white fixed px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100  top-0 z-20 md:static">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={() => {
                  if (billingEnabled && sessionStartedAt && !showSummary) {
                    setShowEndConfirm(true);
                  } else {
                    onBack();
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={header.avatar} alt={header.name} className="w-10 h-10 rounded-full object-cover" />
                {header.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-[#111827] text-base leading-none">{header.name}</h2>
                <span className={`text-[11px] font-bold mt-1 ${header.status === "online" ? "text-green-500" : "text-gray-400"}`}>
                  {header.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {billingEnabled && sessionStartedAt && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#F8F5FF] border border-[#E1D4FF] rounded-full px-3 py-1.5">
                <Timer className="w-4 h-4 text-[#9758FF]" />
                <span className="text-xs font-bold text-[#6B21A8]">₹{ratePerMin}/min</span>
                <span className="text-xs font-bold text-[#111827]">
                  {formatSeconds(remainingSeconds)}
                </span>
              </div>
              <button
                onClick={() => setShowEndConfirm(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5]"
              >
                End
              </button>
            </div>
          )}
        </div>

        {billingEnabled && !canStart && (
          <div className="px-4 py-3 bg-[#FFF7ED] border-b border-[#FED7AA] text-sm text-[#9A3412] flex items-center justify-between">
            <span>Minimum balance ₹{minRequired} required to start chat.</span>
            <button
              onClick={billing?.onLowBalance}
              className="text-[#FF7A1F] font-semibold hover:underline"
            >
              Top up
            </button>
          </div>
        )}

        {billingEnabled && canStart && sessionStartedAt && timeExpired && (
          <div className="px-4 py-3 bg-[#FEF2F2] border-b border-[#FECACA] text-sm text-[#B91C1C]">
            Your chat time is up. Please top up to continue.
          </div>
        )}

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col pb-28 md:pb-6 space-y-4 bg-[#F8F9FA]">
          {messages.map((msg) => {
            const isMe = msg.isMe;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%] ${isMe ? "self-end" : "self-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? "bg-[#9758FF] text-white rounded-tr-sm shadow-sm shadow-[#9758FF]/20"
                      : "bg-white text-[#111827] rounded-tl-sm shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-1 px-1">
                  {msg.time}
                </span>
              </motion.div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-8">Start a conversation</div>
          )}
        </div>

        <div className="bg-white border-t border-gray-100 fixed inset-x-0 bottom-0 z-20 md:static md:inset-auto md:z-auto">
          <div className="px-3 py-2 md:p-4 pb-[env(safe-area-inset-bottom)]">
            {!sessionStartedAt && showTalkNow ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    if (talkNowState === "requesting") return;
                    if (!canStart) {
                      billing?.onLowBalance?.();
                      return;
                    }
                    if (header.status !== "online") {
                      onMentorOffline?.();
                      return;
                    }
                    if (talkNowState === "idle" && onTalkNowRequest) {
                      onTalkNowRequest();
                      return;
                    }
                    startTimerIfNeeded();
                  }}
                  disabled={!canStart || talkNowState === "requesting"}
                  className={`w-full max-w-sm px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    canStart && talkNowState !== "requesting"
                      ? "bg-gradient-to-r from-[#8F5BFF] via-[#9758FF] to-[#A855F7] text-white shadow-lg shadow-[#9758FF]/25 hover:brightness-110 active:scale-[0.99]"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {talkNowState === "requesting" ? "Waiting for mentor..." : "Talk Now"}
                </button>
                <p className="text-[11px] text-[#9CA3AF] font-semibold">
                  {talkNowState === "requesting"
                    ? "We’ll start once the mentor accepts."
                    : `Starts paid chat at ₹${ratePerMin}/min`}
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-[#F8F9FA] rounded-2xl border border-gray-200 flex items-center pr-2 pl-4 py-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={canStart ? "Type a message..." : "Top up to start chatting"}
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] text-sm py-2 font-medium"
                    rows={1}
                    disabled={!canStart || timeExpired}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || !canStart || timeExpired}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                    inputText.trim() && canStart && !timeExpired
                      ? "bg-[#9758FF] text-white shadow-[#9758FF]/30 hover:bg-[#8A4CE6]"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {showEndConfirm && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Timer className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">End Session?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will end the current chat session. You&apos;ll be charged for the time used.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEndConfirm(false);
                    setShowSummary(true);
                  }}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {(summaryOverlay?.show || (showSummary && billingEnabled)) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center mx-auto mb-3">
                <Timer className="w-5 h-5 text-[#9758FF]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">
                {summaryOverlay?.show ? summaryOverlay.title : "Session ended"}
              </h3>
              {(summaryOverlay?.show ? summaryOverlay.lines : [
                `Duration: ${debitedMinutes} min`,
                `Charged: ₹${debitedMinutes * ratePerMin}`,
              ]).map((line, idx) => (
                <p key={idx} className="text-sm text-gray-500 mt-1">
                  {line}
                </p>
              ))}
              <div className="mt-4 grid gap-2">
                {summaryOverlay?.show ? (
                  <button
                    onClick={summaryOverlay.onClose}
                    className="w-full bg-[#9758FF] text-white font-semibold py-2.5 rounded-xl hover:bg-[#8A4FFF]"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      onClick={billing?.onLowBalance}
                      className="w-full bg-[#9758FF] text-white font-semibold py-2.5 rounded-xl hover:bg-[#8A4FFF]"
                    >
                      Top up wallet
                    </button>
                    {onBack && (
                      <button
                        onClick={onBack}
                        className="w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50"
                      >
                        Back to inbox
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
