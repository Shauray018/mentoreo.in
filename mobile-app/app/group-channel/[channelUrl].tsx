// import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
// import { useAuth } from "@/context/AuthContext";
// import { Session, formatPaise, sessionsApi } from "@/services/api";
// import { useGroupChannel } from "@sendbird/uikit-chat-hooks";
// import {
//   GroupChannelContexts,
//   createGroupChannelFragment,
//   useSendbirdChat,
// } from "@sendbird/uikit-react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { useCallback, useContext, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // ─── Module-level ref for header props ─────────────────────────────────────
// // We use a ref object (not a plain variable) so SessionHeader can read
// // the latest value without needing a re-render to be triggered externally.
// type HeaderProps = {
//   session: Session | null;
//   elapsed: number;
//   formatElapsed: () => string;
//   estimatedCost: () => string | null;
//   onEndSession: () => void;
//   ending: boolean;
// };

// const headerPropsRef = { current: null as HeaderProps | null };

// // ─── Custom Header — module level for stable reference ─────────────────────
// function SessionHeader({
//   onPressHeaderLeft,
// }: {
//   onPressHeaderLeft: () => void;
// }) {
//   // Force re-render every second so timer stays live in the header
//   const [, tick] = useState(0);
//   useEffect(() => {
//     const id = setInterval(() => tick((n) => n + 1), 1000);
//     return () => clearInterval(id);
//   }, []);

//   const props = headerPropsRef.current;
//   const { headerTitle } = useContext(GroupChannelContexts.Fragment);
//   const isActive = props?.session?.status === "active";

//   return (
//     <View style={styles.header}>
//       <TouchableOpacity onPress={onPressHeaderLeft} style={styles.headerBack}>
//         <Text style={styles.headerBackText}>‹</Text>
//       </TouchableOpacity>

//       <View style={styles.headerCenter}>
//         {isActive ? (
//           <>
//             <View style={styles.liveRow}>
//               <View style={styles.liveDot} />
//               <Text style={styles.liveLabel}>LIVE</Text>
//             </View>
//             <Text style={styles.timerText}>
//               {props?.formatElapsed() ?? "00:00"}
//             </Text>
//             {props?.estimatedCost() && (
//               <Text style={styles.costText}>~{props.estimatedCost()}</Text>
//             )}
//           </>
//         ) : (
//           <Text style={styles.channelTitle} numberOfLines={1}>
//             {headerTitle}
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//         style={[styles.endBtn, props?.ending && { opacity: 0.6 }]}
//         onPress={() => {
//           // Read from ref at call time — always fresh, never stale
//           headerPropsRef.current?.onEndSession();
//         }}
//         disabled={props?.ending ?? false}
//         activeOpacity={0.8}
//       >
//         {props?.ending ? (
//           <ActivityIndicator color={Colors.error} size="small" />
//         ) : (
//           <Text style={styles.endBtnText}>End</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ─── Fragment — ONCE at module level ───────────────────────────────────────
// const GroupChannelFragment = createGroupChannelFragment({
//   Header: SessionHeader,
// });

// // ─── Inner chat — only mounts after SDK is confirmed ready ─────────────────
// function ChatView({
//   channelUrl,
//   onPressBack,
// }: {
//   channelUrl: string;
//   onPressBack: () => void;
// }) {
//   const { sdk } = useSendbirdChat();
//   const { channel } = useGroupChannel(sdk, channelUrl);

//   console.log(
//     "[chat] ChatView | currentUser:",
//     sdk?.currentUser?.userId ?? "null",
//     "| channel:",
//     channel?.url ?? "null",
//     "| memberCount:",
//     channel?.memberCount ?? "—",
//   );

//   if (!channel) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator color={Colors.accent} size="large" />
//         <Text style={styles.loadingText}>Loading channel…</Text>
//         <Text style={styles.loadingUrl}>{channelUrl}</Text>
//       </View>
//     );
//   }

//   return (
//     <GroupChannelFragment
//       channel={channel}
//       onPressHeaderLeft={onPressBack}
//       onChannelDeleted={() => router.replace("/(tabs)/chat")}
//       onPressHeaderRight={function (): void {
//         throw new Error("Function not implemented.");
//       }}
//     />
//   );
// }

// // ─── Main screen ───────────────────────────────────────────────────────────
// export default function GroupChannelScreen() {
//   const { channelUrl } = useLocalSearchParams<{ channelUrl: string }>();
//   const { user } = useAuth();
//   const { sdk } = useSendbirdChat();

//   const [sdkReady, setSdkReady] = useState(!!sdk?.currentUser);
//   const [ending, setEnding] = useState(false);
//   const [session, setSession] = useState<Session | null>(null);
//   const [elapsed, setElapsed] = useState(0);
//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // ── Reconnect Sendbird if needed ──────────────────────────────────────
//   useEffect(() => {
//     if (sdk?.currentUser) {
//       console.log("[chat] SDK already connected as:", sdk.currentUser.userId);
//       setSdkReady(true);
//       return;
//     }
//     if (!user) return;
//     console.log("[chat] reconnecting SDK as:", user.id);
//     sdk
//       .connect(user.id)
//       .then((u) => {
//         console.log("[chat] reconnected:", u?.userId);
//         setSdkReady(true);
//       })
//       .catch((e) => console.error("💥 [chat] reconnect failed:", e));
//   }, []);

//   // ── Session polling ───────────────────────────────────────────────────
//   const loadSession = useCallback(async () => {
//     try {
//       const res = await sessionsApi.getActive(user!.token);
//       setSession(res.session);
//     } catch (e) {
//       console.error("💥 [chat] session fetch:", e);
//     }
//   }, [user]);

//   useEffect(() => {
//     loadSession();
//     pollRef.current = setInterval(loadSession, 8000);
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//   }, [loadSession]);

//   // ── Elapsed timer ─────────────────────────────────────────────────────
//   useEffect(() => {
//     if (session?.status === "active" && session.started_at) {
//       if (timerRef.current) return;
//       timerRef.current = setInterval(() => {
//         const started = new Date(session.started_at!).getTime();
//         setElapsed(Math.floor((Date.now() - started) / 1000));
//       }, 1000);
//     } else {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [session?.status, session?.started_at]);

//   // ── Auto-redirect when session ends from other side ───────────────────
//   useEffect(() => {
//     if (
//       session &&
//       ["completed", "cancelled", "expired"].includes(session.status)
//     ) {
//       if (pollRef.current) clearInterval(pollRef.current);
//       Alert.alert(
//         "Session Ended",
//         session.ended_by === "system"
//           ? "Session expired."
//           : "The session has been ended.",
//         [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
//       );
//     }
//   }, [session?.status]);

//   // ── Helpers ───────────────────────────────────────────────────────────
//   const formatElapsed = useCallback(() => {
//     const m = Math.floor(elapsed / 60);
//     const s = elapsed % 60;
//     return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   }, [elapsed]);

//   const estimatedCost = useCallback(() => {
//     if (!session) return null;
//     const mins = Math.max(1, Math.ceil(elapsed / 60));
//     return formatPaise(mins * session.rate_per_minute_paise);
//   }, [session, elapsed]);

//   const handleEndSession = useCallback(() => {
//     if (!session) {
//       console.warn("[chat] End tapped but session is null");
//       return;
//     }
//     const mins = Math.max(1, Math.ceil(elapsed / 60));
//     const cost = formatPaise(mins * session.rate_per_minute_paise);
//     console.log(
//       "[chat] Ending session:",
//       session.id,
//       "mins:",
//       mins,
//       "cost:",
//       cost,
//     );
//     Alert.alert(
//       "End Session",
//       `${mins} minute(s) · ${cost}\n\nThis will end the session for both of you.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "End Session",
//           style: "destructive",
//           onPress: async () => {
//             setEnding(true);
//             try {
//               await sessionsApi.end(session.id, user!.token);
//               router.replace("/(tabs)");
//             } catch (e: any) {
//               Alert.alert("Error", e.message || "Could not end session");
//               setEnding(false);
//             }
//           },
//         },
//       ],
//     );
//   }, [session, elapsed, user]);

//   // ── Write fresh values into the ref every render ──────────────────────
//   // SessionHeader reads from this ref at press time → always fresh, never stale
//   headerPropsRef.current = {
//     session,
//     elapsed,
//     formatElapsed,
//     estimatedCost,
//     onEndSession: handleEndSession,
//     ending,
//   };

//   if (Platform.OS === "web") {
//     return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
//   }

//   if (!sdkReady) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator color={Colors.accent} size="large" />
//         <Text style={styles.loadingText}>Connecting to chat…</Text>
//       </View>
//     );
//   }

//   return <ChatView channelUrl={channelUrl} onPressBack={() => router.back()} />;
// }

// // ─── Styles ────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   centered: {
//     flex: 1,
//     backgroundColor: Colors.bg,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: Spacing.sm,
//   },
//   loadingText: {
//     fontSize: FontSize.md,
//     color: Colors.textSecondary,
//     fontWeight: "600",
//   },
//   loadingUrl: {
//     fontSize: FontSize.xs,
//     color: Colors.textMuted,
//     opacity: 0.5,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.bgCard,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     paddingTop: Platform.OS === "ios" ? 54 : 12,
//     paddingBottom: 10,
//     paddingHorizontal: Spacing.sm,
//     minHeight: Platform.OS === "ios" ? 96 : 60,
//   },
//   headerBack: {
//     width: 40,
//     height: 40,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerBackText: {
//     fontSize: 32,
//     color: Colors.accent,
//     lineHeight: 36,
//     marginTop: -2,
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 4,
//   },
//   channelTitle: {
//     fontSize: FontSize.md,
//     fontWeight: "700",
//     color: Colors.textPrimary,
//   },
//   liveRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 1,
//   },
//   liveDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: Colors.success,
//     marginRight: 5,
//   },
//   liveLabel: {
//     fontSize: FontSize.xs,
//     fontWeight: "800",
//     color: Colors.success,
//     letterSpacing: 1.5,
//   },
//   timerText: {
//     fontSize: FontSize.xl,
//     fontWeight: "800",
//     color: Colors.textPrimary,
//     fontVariant: ["tabular-nums"],
//     letterSpacing: -0.5,
//     lineHeight: 26,
//   },
//   costText: {
//     fontSize: FontSize.xs,
//     color: Colors.accent,
//     fontWeight: "600",
//     marginTop: 1,
//   },
//   endBtn: {
//     backgroundColor: Colors.error + "1A",
//     borderWidth: 1,
//     borderColor: Colors.error + "66",
//     borderRadius: Radius.md,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     minWidth: 52,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   endBtnText: {
//     fontSize: FontSize.sm,
//     fontWeight: "700",
//     color: Colors.error,
//   },
// });
import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { formatPaise } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useGroupChannel } from "@sendbird/uikit-chat-hooks";
import {
  GroupChannelContexts,
  createGroupChannelFragment,
  useSendbirdChat,
} from "@sendbird/uikit-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Module-level header props ref ─────────────────────────────────────────
type HeaderProps = {
  isActive: boolean;
  elapsed: number;
  formatElapsed: () => string;
  estimatedCost: () => string | null;
  onEndSession: () => void;
  ending: boolean;
};

const headerPropsRef = { current: null as HeaderProps | null };

// ─── Custom Header — defined at module level for stable reference ───────────
function SessionHeader({
  onPressHeaderLeft,
}: {
  onPressHeaderLeft: () => void;
}) {
  // Tick every second so the timer re-renders
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const props = headerPropsRef.current;
  const { headerTitle } = useContext(GroupChannelContexts.Fragment);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPressHeaderLeft} style={styles.headerBack}>
        <Text style={styles.headerBackText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        {props?.isActive ? (
          <>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
            <Text style={styles.timerText}>{props.formatElapsed()}</Text>
            {props.estimatedCost() && (
              <Text style={styles.costText}>~{props.estimatedCost()}</Text>
            )}
          </>
        ) : (
          <Text style={styles.channelTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.endBtn, props?.ending && { opacity: 0.6 }]}
        onPress={() => headerPropsRef.current?.onEndSession()}
        disabled={props?.ending ?? false}
        activeOpacity={0.8}
      >
        {props?.ending ? (
          <ActivityIndicator color={Colors.error} size="small" />
        ) : (
          <Text style={styles.endBtnText}>End</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Fragment — ONCE at module level ───────────────────────────────────────
const GroupChannelFragment = createGroupChannelFragment({
  Header: SessionHeader,
});

// ─── Inner chat — only mounts after SDK is confirmed ready ─────────────────
function ChatView({
  channelUrl,
  onPressBack,
}: {
  channelUrl: string;
  onPressBack: () => void;
}) {
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl);

  console.log(
    "[chat] currentUser:",
    sdk?.currentUser?.userId ?? "null",
    "| channel:",
    channel?.url ?? "null",
  );

  if (!channel) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading channel…</Text>
        <Text style={styles.loadingUrl}>{channelUrl}</Text>
      </View>
    );
  }

  return (
    <GroupChannelFragment
      channel={channel}
      onPressHeaderLeft={onPressBack}
      onChannelDeleted={() => router.replace("/(tabs)/chat")}
      onPressHeaderRight={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function GroupChannelScreen() {
  const { channelUrl } = useLocalSearchParams<{ channelUrl: string }>();
  const { user } = useAuthStore();
  const { sdk } = useSendbirdChat();

  // Pull session from global store — no local polling needed here
  const session = useSessionStore((s) => s.session);
  const storeEndSession = useSessionStore((s) => s.endSession);

  const [sdkReady, setSdkReady] = useState(!!sdk?.currentUser);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Reconnect Sendbird if needed ──────────────────────────────────────
  useEffect(() => {
    if (sdk?.currentUser) {
      console.log("[chat] SDK already connected as:", sdk.currentUser.userId);
      setSdkReady(true);
      return;
    }
    if (!user) return;
    console.log("[chat] reconnecting SDK as:", user.id);
    sdk
      .connect(user.id)
      .then((u) => {
        console.log("[chat] reconnected:", u?.userId);
        setSdkReady(true);
      })
      .catch((e) => console.error("💥 [chat] reconnect failed:", e));
  }, []);

  // ── Elapsed timer driven by session.started_at ────────────────────────
  useEffect(() => {
    if (session?.status === "active" && session.started_at) {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        const started = new Date(session.started_at!).getTime();
        setElapsed(Math.floor((Date.now() - started) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session?.status, session?.started_at]);

  // ── Auto-redirect when session ends from other side ───────────────────
  useEffect(() => {
    if (
      session &&
      ["completed", "cancelled", "expired"].includes(session.status)
    ) {
      Alert.alert(
        "Session Ended",
        session.ended_by === "system"
          ? "Session expired."
          : "The session has been ended.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    }
  }, [session?.status]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatElapsed = useCallback(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [elapsed]);

  const estimatedCost = useCallback(() => {
    if (!session) return null;
    const mins = Math.max(1, Math.ceil(elapsed / 60));
    return formatPaise(mins * session.rate_per_minute_paise);
  }, [session, elapsed]);

  const handleEndSession = useCallback(() => {
    if (!session || !user) {
      console.warn("[chat] End tapped but session or user is null");
      return;
    }
    const mins = Math.max(1, Math.ceil(elapsed / 60));
    const cost = formatPaise(mins * session.rate_per_minute_paise);
    Alert.alert(
      "End Session",
      `${mins} minute(s) · ${cost}\n\nThis will end the session for both of you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            setEnding(true);
            try {
              // Store handles API call + wallet refresh
              await storeEndSession(session.id, user.token);
              router.replace("/(tabs)");
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not end session");
              setEnding(false);
            }
          },
        },
      ],
    );
  }, [session, elapsed, user, storeEndSession]);

  // ── Update ref every render so header always reads fresh values ────────
  headerPropsRef.current = {
    isActive: session?.status === "active",
    elapsed,
    formatElapsed,
    estimatedCost,
    onEndSession: handleEndSession,
    ending,
  };

  if (Platform.OS === "web") {
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  if (!sdkReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.loadingText}>Connecting to chat…</Text>
      </View>
    );
  }

  return <ChatView channelUrl={channelUrl} onPressBack={() => router.back()} />;
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  loadingUrl: { fontSize: FontSize.xs, color: Colors.textMuted, opacity: 0.5 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Platform.OS === "ios" ? 54 : 12,
    paddingBottom: 10,
    paddingHorizontal: Spacing.sm,
    minHeight: Platform.OS === "ios" ? 96 : 60,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackText: {
    fontSize: 32,
    color: Colors.accent,
    lineHeight: 36,
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  channelTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  liveRow: { flexDirection: "row", alignItems: "center", marginBottom: 1 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 5,
  },
  liveLabel: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.success,
    letterSpacing: 1.5,
  },
  timerText: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  costText: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: "600",
    marginTop: 1,
  },
  endBtn: {
    backgroundColor: Colors.error + "1A",
    borderWidth: 1,
    borderColor: Colors.error + "66",
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  endBtnText: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.error },
});
