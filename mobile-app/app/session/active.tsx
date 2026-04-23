import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActiveSessionScreen() {
  const { user } = useAuthStore();
  const session = useSessionStore((s) => s.session);
  const isLoading = useSessionStore((s) => s.isLoading);
  const cancelSession = useSessionStore((s) => s.cancelSession);

  // Auto-redirect when session becomes active
  useEffect(() => {
    if (session?.status === "active" && session.sendbird_channel_url) {
      router.replace(`/group-channel/${session.sendbird_channel_url}`);
    }
  }, [session?.status, session?.sendbird_channel_url]);

  // Expiry countdown
  const [expiryCountdown, setExpiryCountdown] = useState("");
  useEffect(() => {
    if (!session?.expires_at || session.status !== "pending") return;
    const tick = () => {
      const diff = new Date(session.expires_at).getTime() - Date.now();
      if (diff <= 0) {
        setExpiryCountdown("Expired");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setExpiryCountdown(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.expires_at, session?.status]);

  const handleCancel = () => {
    if (!session || !user) return;
    Alert.alert("Cancel Request", "Cancel this session request?", [
      { text: "No", style: "cancel" },
      {
        text: "Cancel Request",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelSession(session.id, user.token);
            router.replace("/(tabs)");
          } catch (e: any) {
            Alert.alert("Error", e.message || "Could not cancel");
          }
        },
      },
    ]);
  };

  if (!session) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.glow} />
      <View style={styles.inner}>
        <View style={styles.statusPill}>
          <View style={styles.statusPillDot} />
          <Text style={styles.statusPillText}>WAITING FOR MENTOR</Text>
        </View>

        <Text style={styles.withLabel}>Requested session with</Text>
        <Text style={styles.withEmail}>{session.mentor_email}</Text>

        <View style={styles.countdownCard}>
          <Text style={styles.countdownEmoji}>⏳</Text>
          <Text style={styles.countdownTitle}>Request expires in</Text>
          <Text style={styles.countdownValue}>{expiryCountdown || "—"}</Text>
          <Text style={styles.countdownSub}>
            You'll be taken into chat automatically once accepted
          </Text>
        </View>

        <View style={styles.pollingRow}>
          <ActivityIndicator
            color={Colors.textMuted}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.pollingText}>Checking for updates…</Text>
        </View>

        {user?.role === "student" && (
          <TouchableOpacity
            style={[styles.cancelBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textSecondary} size="small" />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          style={styles.homeLink}
        >
          <Text style={styles.homeLinkText}>← Back to home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#5B6EF5",
    opacity: 0.07,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.warn,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.warn,
    letterSpacing: 1.5,
  },
  withLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  withEmail: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  countdownCard: {
    width: "100%",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: 6,
  },
  countdownEmoji: { fontSize: 40 },
  countdownTitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  countdownValue: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.warn,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  countdownSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  pollingRow: { flexDirection: "row", alignItems: "center" },
  pollingText: { fontSize: FontSize.xs, color: Colors.textMuted },
  cancelBtn: {
    width: "100%",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  homeLink: { marginTop: Spacing.xs },
  homeLinkText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
