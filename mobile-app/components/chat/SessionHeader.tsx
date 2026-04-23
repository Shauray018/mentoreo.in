import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import { formatPaise } from "@/services/api";
import { useGroupChannel } from "@sendbird/uikit-chat-hooks";
import {
    useSendbirdChat
} from "@sendbird/uikit-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  channelUrl: string;
  onPressHeaderLeft: () => void;
  onEndSession: () => void;
  ending: boolean;
  sessionStatus: string | null; // "active" | "completed" | null etc.
  startedAt: string | null; // ISO string from session.started_at
  ratePerMinutePaise: number | null;
};

export function SessionHeader({
  channelUrl,
  onPressHeaderLeft,
  onEndSession,
  ending,
  sessionStatus,
  startedAt,
  ratePerMinutePaise,
}: Props) {
  // ── Resolve channel to get mentor profile ─────────────────────────────
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl);
  const mentor = useMentorProfile(channel ?? null);

  // ── Timer — computed entirely inside this component from started_at ───
  // This is the fix: we don't rely on a stale closure from the parent.
  // We compute elapsed directly from the raw timestamp every second.
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionStatus === "active" && startedAt) {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        const started = new Date(startedAt).getTime();
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
  }, [sessionStatus, startedAt]);

  const isActive = sessionStatus === "active";
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const formattedTime = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const estimatedCost = (() => {
    if (!ratePerMinutePaise) return null;
    const mins = Math.max(1, Math.ceil(elapsed / 60));
    return formatPaise(mins * ratePerMinutePaise);
  })();

  const displayName = mentor?.display_name ?? "Mentor";
  const avatarUrl =
    mentor?.avatar_url && mentor.avatar_url.length > 0
      ? mentor.avatar_url
      : null;
  const initial = displayName[0]?.toUpperCase() ?? "M";

  return (
    <View style={styles.header}>
      {/* Back */}
      <TouchableOpacity onPress={onPressHeaderLeft} style={styles.headerBack}>
        <Text style={styles.headerBackText}>‹</Text>
      </TouchableOpacity>

      {/* Mentor info + timer */}
      <View style={styles.headerCenter}>
        <View style={styles.mentorRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.mentorText}>
            <Text style={styles.mentorName} numberOfLines={1}>
              {displayName}
            </Text>
            {isActive ? (
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>
                  {formattedTime}
                  {estimatedCost ? ` · ~${estimatedCost}` : ""}
                </Text>
              </View>
            ) : (
              <Text style={styles.endedLabel}>Session ended</Text>
            )}
          </View>
        </View>
      </View>

      {/* End button — only when active */}
      {isActive && (
        <TouchableOpacity
          style={[styles.endBtn, ending && { opacity: 0.6 }]}
          onPress={onEndSession}
          disabled={ending}
          activeOpacity={0.8}
        >
          {ending ? (
            <ActivityIndicator color={Colors.error} size="small" />
          ) : (
            <Text style={styles.endBtnText}>End</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerCenter: { flex: 1, paddingHorizontal: 4 },
  mentorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent + "44",
  },
  avatarInitial: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.accent,
  },
  mentorText: { flex: 1 },
  mentorName: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  liveRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 5,
  },
  liveLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.success,
  },
  endedLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
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
