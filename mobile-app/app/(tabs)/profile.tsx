import EditProfile from "@/components/pages/edit-profile";
import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useWalletStore } from "@/stores/walletStore";
import { useSendbirdChat } from "@sendbird/uikit-react-native";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileTab() {
  const { user } = useAuthStore();
  return user?.role === "student" ? <StudentProfileTab /> : <EditProfile />;
}

function StudentProfileTab() {
  const { user, signOut } = useAuthStore();
  const resetSession = useSessionStore((s) => s.reset);
  const resetWallet = useWalletStore((s) => s.reset);
  const { sdk } = useSendbirdChat();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await sdk.disconnect();
          resetSession();
          resetWallet();
          signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role === "student" ? "🎓 Student" : "🧠 Mentor"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <InfoRow label="Name" value={user?.name ?? "—"} />
        <InfoRow label="Email" value={user?.email ?? "—"} />
        <InfoRow
          label="Role"
          value={user?.role === "student" ? "Student" : "Mentor"}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Mentoreo v1.0</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.md, paddingTop: 60, paddingBottom: 60 },
  avatarSection: { alignItems: "center", marginBottom: Spacing.xl },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentDim,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarInitials: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.accent,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: 2,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  signOutBtn: {
    backgroundColor: Colors.error + "1A",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + "55",
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.error,
  },
  versionText: {
    textAlign: "center",
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
