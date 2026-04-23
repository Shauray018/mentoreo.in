import { SessionHeader } from "@/components/chat/SessionHeader";
import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { formatPaise, sessionsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useGroupChannel } from "@sendbird/uikit-chat-hooks";
import {
  createGroupChannelFragment,
  useSendbirdChat,
} from "@sendbird/uikit-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Fragment with custom header — ONCE at module level ────────────────────
const GroupChannelFragment = createGroupChannelFragment({
  Header: ({ onPressHeaderLeft }) => {
    // These are read from the module-level ref so they're always fresh
    const ref = fragmentPropsRef.current;
    return (
      <SessionHeader
        channelUrl={ref?.channelUrl ?? ""}
        onPressHeaderLeft={onPressHeaderLeft}
        onEndSession={ref?.onEndSession ?? (() => {})}
        ending={ref?.ending ?? false}
        sessionStatus={ref?.sessionStatus ?? null}
        startedAt={ref?.startedAt ?? null}
        ratePerMinutePaise={ref?.ratePerMinutePaise ?? null}
      />
    );
  },
});

// Module-level ref so the Header lambda above can read fresh values
// without causing a remount of the fragment
type FragmentProps = {
  channelUrl: string;
  onEndSession: () => void;
  ending: boolean;
  sessionStatus: string | null;
  startedAt: string | null;
  ratePerMinutePaise: number | null;
};
const fragmentPropsRef = { current: null as FragmentProps | null };

// ─── ChatView — mounts only after SDK is ready ─────────────────────────────
function ChatView({
  channelUrl,
  onPressBack,
}: {
  channelUrl: string;
  onPressBack: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl);
  const [requesting, setRequesting] = useState(false);

  const channelData = (() => {
    try {
      return channel?.data ? JSON.parse(channel.data) : {};
    } catch {
      return {};
    }
  })();
  const mentorEmail = channelData?.mentorEmail as string | undefined;
  const isReadOnly = channel?.isFrozen || channelData?.state === "ended";

  const handleTalkNow = async () => {
    if (!mentorEmail || !user?.token) {
      Alert.alert("Unavailable", "Mentor details unavailable.");
      return;
    }
    Alert.alert("Request Session", "Start a new session with this mentor?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Request",
        onPress: async () => {
          setRequesting(true);
          try {
            await sessionsApi.request(mentorEmail, user.token);
            router.push("/session/active");
          } catch (e: any) {
            Alert.alert("Error", e.message || "Could not request session");
          } finally {
            setRequesting(false);
          }
        },
      },
    ]);
  };

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
    <View style={{ flex: 1 }}>
      <GroupChannelFragment
        channel={channel}
        onPressHeaderLeft={onPressBack}
        onChannelDeleted={() => router.replace("/(tabs)/chat")}
        onBeforeSendUserMessage={(params) => {
          if (isReadOnly) throw new Error("This session has ended.");
          return params;
        }}
        onBeforeSendFileMessage={(params) => {
          if (isReadOnly) throw new Error("This session has ended.");
          return params;
        }}
        onPressHeaderRight={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      {isReadOnly && (
        <View style={styles.endedOverlay}>
          <Text style={styles.endedText}>
            This session has ended. Start a new request to continue.
          </Text>
          <TouchableOpacity
            style={[styles.talkNowBtn, requesting && { opacity: 0.6 }]}
            onPress={handleTalkNow}
            disabled={requesting}
            activeOpacity={0.85}
          >
            {requesting ? (
              <ActivityIndicator color={Colors.bg} size="small" />
            ) : (
              <Text style={styles.talkNowBtnText}>Talk Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function GroupChannelScreen() {
  const { channelUrl } = useLocalSearchParams<{ channelUrl: string }>();
  const { user } = useAuthStore();
  const { sdk } = useSendbirdChat();

  const session = useSessionStore((s) => s.session);
  const storeEndSession = useSessionStore((s) => s.endSession);

  const [sdkReady, setSdkReady] = useState(!!sdk?.currentUser);
  const [ending, setEnding] = useState(false);

  // ── Reconnect Sendbird if needed ──────────────────────────────────────
  useEffect(() => {
    if (sdk?.currentUser) {
      setSdkReady(true);
      return;
    }
    if (!user) return;
    sdk
      .connect(user.id)
      .then(() => setSdkReady(true))
      .catch((e) => console.error("💥 [chat] reconnect failed:", e));
  }, []);

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

  const handleEndSession = useCallback(() => {
    if (!session || !user) return;
    // Read elapsed directly from started_at — same as SessionHeader does
    const started = session.started_at
      ? new Date(session.started_at).getTime()
      : Date.now();
    const elapsedSecs = Math.floor((Date.now() - started) / 1000);
    const mins = Math.max(1, Math.ceil(elapsedSecs / 60));
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
  }, [session, user, storeEndSession]);

  // ── Write fresh props into ref every render ───────────────────────────
  fragmentPropsRef.current = {
    channelUrl,
    onEndSession: handleEndSession,
    ending,
    sessionStatus: session?.status ?? null,
    startedAt: session?.started_at ?? null,
    ratePerMinutePaise: session?.rate_per_minute_paise ?? null,
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
  endedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? 34 : Spacing.md,
    gap: Spacing.sm,
  },
  endedText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  talkNowBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  talkNowBtnText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.bg,
  },
});
