import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import {
  MentorProfile,
  formatPaise,
  mentorsApi,
  tierColor
} from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Student Home: Browse Mentors ──────────────────────────────────────────
function StudentHome() {
  const { user } = useAuthStore();
  const session = useSessionStore((s) => s.session);
  const refresh = useSessionStore((s) => s.refresh);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [filtered, setFiltered] = useState<MentorProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const mentorList = await mentorsApi.list();
      setMentors(mentorList);
      setFiltered(mentorList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(mentors);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        mentors.filter((m) => {
          const name = (m.display_name ?? "").toLowerCase();
          const college = (m.college ?? "").toLowerCase();
          const tags = m.expertise_tags ?? [];

          return (
            name.includes(q) ||
            college.includes(q) ||
            tags.some((t) => (t ?? "").toLowerCase().includes(q))
          );
        }),
      );
    }
  }, [search, mentors]);

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
    load();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Active session banner */}
      {/* {activeSession && (
        <TouchableOpacity
          style={styles.sessionBanner}
          onPress={() => router.push("/session/active")}
        >
          <View style={styles.sessionBannerDot} />
          <Text style={styles.sessionBannerText}>
            {activeSession.status === "pending"
              ? "⏳ Waiting for mentor to accept…"
              : "🟢 Session active — tap to open"}
          </Text>
          <Text style={styles.sessionBannerArrow}>›</Text>
        </TouchableOpacity>
      )} */}
      {session &&
        (session.status === "pending" || session.status === "active") && (
          <TouchableOpacity
            style={styles.sessionBanner}
            onPress={() =>
              session.status === "active" && session.sendbird_channel_url
                ? router.push(`/group-channel/${session.sendbird_channel_url}`)
                : router.push("/session/active")
            }
          >
            <View style={styles.sessionBannerDot} />
            <Text style={styles.sessionBannerText}>
              {session.status === "pending"
                ? "⏳ Waiting for mentor to accept…"
                : "🟢 Session active — tap to open chat"}
            </Text>
            <Text style={styles.sessionBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.email}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.greeting}>
              Hey {user?.name?.split(" ")[0]} 👋
            </Text>
            <Text style={styles.subGreeting}>Find your perfect mentor</Text>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, college, or skill…"
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <MentorCard mentor={item} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No mentors found</Text>
          </View>
        }
      />
    </View>
  );
}

function MentorCard({ mentor }: { mentor: MentorProfile }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mentor/${encodeURIComponent(mentor.email)}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {mentor.avatar_url ? (
            <Image source={{ uri: mentor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {mentor.display_name?.[0]?.toUpperCase() ?? "M"}
              </Text>
            </View>
          )}
          {mentor.is_available && <View style={styles.onlineDot} />}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{mentor.display_name}</Text>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: tierColor(mentor.tier) + "22" },
              ]}
            >
              <Text
                style={[styles.tierText, { color: tierColor(mentor.tier) }]}
              >
                {mentor.tier}
              </Text>
            </View>
          </View>
          <Text style={styles.cardCollege} numberOfLines={1}>
            {mentor.college} · {mentor.course}
          </Text>
          <View style={styles.tagsRow}>
            {mentor.expertise_tags?.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rate */}
        <View style={styles.rateBox}>
          <Text style={styles.rateAmount}>₹{mentor.rate_per_minute}</Text>
          <Text style={styles.rateLabel}>/min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Mentor Home: Incoming Requests ────────────────────────────────────────
function MentorHome() {
  const { user } = useAuthStore();
  const session = useSessionStore((s) => s.session);
  const isLoading = useSessionStore((s) => s.isLoading);
  const acceptSession = useSessionStore((s) => s.acceptSession);
  const declineSession = useSessionStore((s) => s.declineSession);

  const handleAccept = async () => {
    if (!session || !user) return;
    try {
      const accepted = await acceptSession(session.id, user.token);
      if (accepted.sendbird_channel_url) {
        router.push(`/group-channel/${accepted.sendbird_channel_url}`);
      } else {
        router.push("/session/active");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDecline = () => {
    if (!session || !user) return;
    Alert.alert("Decline Request", "Are you sure you want to decline?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          try {
            await declineSession(session.id, user.token);
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  return (
    // <ScrollView
    //   style={styles.root}
    //   contentContainerStyle={styles.listContent}
    //   refreshControl={
    //     <RefreshControl
    //       refreshing={isLoading}
    //       onRefresh={load}
    //       tintColor={Colors.accent}
    //     />
    //   }
    // >
    //   <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]} 👋</Text>
    //   <Text style={styles.subGreeting}>Your session dashboard</Text>

    //   {!activeSession ? (
    //     <View style={styles.emptyCard}>
    //       <Text style={styles.emptyEmoji}>📭</Text>
    //       <Text style={styles.emptyCardTitle}>No active requests</Text>
    //       <Text style={styles.emptyCardSub}>
    //         Students will appear here when they request a session with you.
    //       </Text>
    //     </View>
    //   ) : activeSession.status === "pending" ? (
    //     <View style={styles.requestCard}>
    //       <View style={styles.requestHeader}>
    //         <View style={styles.requestPulse} />
    //         <Text style={styles.requestHeaderText}>New Session Request</Text>
    //       </View>
    //       <Text style={styles.requestFrom}>
    //         From{" "}
    //         <Text style={{ color: Colors.accent }}>
    //           {activeSession.student_email}
    //         </Text>
    //       </Text>
    //       <Text style={styles.requestRate}>
    //         Rate: {formatPaise(activeSession.rate_per_minute_paise)}/min
    //       </Text>
    //       <Text style={styles.requestExpiry}>
    //         Expires at {new Date(activeSession.expires_at).toLocaleTimeString()}
    //       </Text>

    //       <View style={styles.actionRow}>
    //         <TouchableOpacity
    //           style={styles.declineBtn}
    //           onPress={handleDecline}
    //           activeOpacity={0.8}
    //         >
    //           <Text style={styles.declineBtnText}>Decline</Text>
    //         </TouchableOpacity>
    //         <TouchableOpacity
    //           style={[styles.acceptBtn, accepting && { opacity: 0.7 }]}
    //           onPress={handleAccept}
    //           disabled={accepting}
    //           activeOpacity={0.85}
    //         >
    //           {accepting ? (
    //             <ActivityIndicator color={Colors.bg} />
    //           ) : (
    //             <Text style={styles.acceptBtnText}>Accept ✓</Text>
    //           )}
    //         </TouchableOpacity>
    //       </View>
    //     </View>
    //   ) : (
    //     <TouchableOpacity
    //       style={styles.activeSessionCard}
    //       onPress={() => router.push("/session/active")}
    //       activeOpacity={0.85}
    //     >
    //       <View style={styles.liveRow}>
    //         <View style={styles.liveDot} />
    //         <Text style={styles.liveText}>LIVE SESSION</Text>
    //       </View>
    //       <Text style={styles.activeSessionWith}>
    //         With {activeSession.student_email}
    //       </Text>
    //       <Text style={styles.activeSessionSub}>Tap to open chat →</Text>
    //     </TouchableOpacity>
    //   )}
    // </ScrollView>
    <ScrollView style={styles.root} contentContainerStyle={styles.listContent}>
      <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0]} 👋</Text>
      <Text style={styles.subGreeting}>Your session dashboard</Text>

      {!session ||
      (session.status !== "pending" && session.status !== "active") ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyCardTitle}>No active requests</Text>
          <Text style={styles.emptyCardSub}>
            Students will appear here when they request a session with you.
          </Text>
        </View>
      ) : session.status === "pending" ? (
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.requestPulse} />
            <Text style={styles.requestHeaderText}>New Session Request</Text>
          </View>
          <Text style={styles.requestFrom}>
            From{" "}
            <Text style={{ color: Colors.accent }}>
              {session.student_email}
            </Text>
          </Text>
          <Text style={styles.requestRate}>
            Rate: {formatPaise(session.rate_per_minute_paise)}/min
          </Text>
          <Text style={styles.requestExpiry}>
            Expires at {new Date(session.expires_at).toLocaleTimeString()}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              activeOpacity={0.8}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, isLoading && { opacity: 0.7 }]}
              onPress={handleAccept}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.acceptBtnText}>Accept ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.activeSessionCard}
          onPress={() =>
            session.sendbird_channel_url
              ? router.push(`/group-channel/${session.sendbird_channel_url}`)
              : router.push("/session/active")
          }
          activeOpacity={0.85}
        >
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE SESSION</Text>
          </View>
          <Text style={styles.activeSessionWith}>
            With {session.student_email}
          </Text>
          <Text style={styles.activeSessionSub}>Tap to open chat →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────
export default function HomeTab() {
  const { user } = useAuthStore();
  return user?.role === "student" ? <StudentHome /> : <MentorHome />;
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: 32,
  },

  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  sessionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentDim,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent + "44",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    paddingTop: 50,
  },
  sessionBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: 8,
  },
  sessionBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: "600",
  },
  sessionBannerArrow: { fontSize: FontSize.lg, color: Colors.accent },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  avatarWrap: { position: "relative", marginRight: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 16 },
  avatarFallback: {
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.accent,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  cardInfo: { flex: 1 },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  cardName: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tierText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardCollege: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  rateBox: { alignItems: "flex-end", justifyContent: "flex-start" },
  rateAmount: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.accent,
  },
  rateLabel: { fontSize: FontSize.xs, color: Colors.textMuted },

  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },

  // Mentor styles
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyCardSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  requestCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.accent + "66",
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  requestPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    marginRight: 8,
  },
  requestHeaderText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  requestFrom: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  requestRate: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  requestExpiry: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  actionRow: { flexDirection: "row", gap: Spacing.sm },
  declineBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  declineBtnText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  acceptBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: "center",
  },
  acceptBtnText: { fontSize: FontSize.md, fontWeight: "700", color: Colors.bg },

  activeSessionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.success + "66",
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  liveRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 8,
  },
  liveText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.success,
    letterSpacing: 2,
  },
  activeSessionWith: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  activeSessionSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
