import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { MentorProfile, formatPaise, mentorsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image, Separator, Text, XStack, YStack } from "tamagui";

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
            <YStack gap={2} padding={4} marginBottom={6}>
              <Text fontSize={13} fontWeight={700} color={"#6A7282"}>
                Welcome back,
              </Text>
              <Text fontSize={20} fontWeight={700} color={"#263238"}>
                {user?.name?.split(" ")[0]}
              </Text>
            </YStack>

            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, college, or skill…"
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              <XStack
                borderWidth={1}
                backgroundColor={"#FCD310"}
                borderRadius={8}
                padding={4}
                paddingHorizontal={8}
              >
                <FontAwesome6 name="bolt" size={16} color="#263238" />
              </XStack>
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

// ─── Mentor Card ────────────────────────────────────────────────────────────
function MentorCard({ mentor }: { mentor: MentorProfile }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mentor/${encodeURIComponent(mentor.email)}`)}
      activeOpacity={0.8}
    >
      <XStack justifyContent="space-between">
        <XStack gap={10} alignItems="center">
          {mentor.avatar_url ? (
            <Image
              src={mentor.avatar_url}
              width={60}
              height={60}
              borderWidth={1.5}
              borderRadius={16}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {mentor.display_name?.[0]?.toUpperCase() ?? "M"}
              </Text>
            </View>
          )}
          <YStack>
            <Text fontSize={18} fontWeight={700} color={"#263238"}>
              {mentor.display_name}
            </Text>
            <Text color={"#4A5565"} fontSize={14} fontWeight={500}>
              {mentor.course}
            </Text>
            <Text
              color={"#FF6B00"}
              fontSize={12}
              fontWeight={600}
              maxWidth={200}
              numberOfLines={1}
            >
              {mentor.college}
            </Text>
          </YStack>
        </XStack>
        <AntDesign name="star" size={24} color="black" />
      </XStack>
      <Separator alignSelf="stretch" marginTop={20} />
      <XStack justifyContent="space-between" alignItems="center" marginTop={20}>
        <YStack>
          <Text color={"#6A7282"} fontSize={11} fontWeight={700}>
            Price
          </Text>
          <Text color={"#263238"} fontSize={14} fontWeight={700}>
            ₹{mentor.rate_per_minute}/min
          </Text>
        </YStack>

        <XStack
          justifyContent="space-between"
          alignItems="center"
          borderWidth={1.5}
          borderRadius={14}
          padding={10}
          paddingHorizontal={14}
          backgroundColor={"#FF6B00"}
        >
          <Text color={"white"} paddingRight={10} fontWeight={700}>
            Book
          </Text>
          <AntDesign name="arrow-right" size={14} color="white" />
        </XStack>
      </XStack>
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

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const sessionId = response.notification.request.content.data?.sessionId;
        if (sessionId) {
          router.push("/(tabs)");
        }
      },
    );
    return () => subscription.remove();
  }, []);

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
    <View style={styles.root}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.listContent}
      >
        {/* ── Header — identical to StudentHome greeting ── */}
        <YStack gap={2} padding={4} marginBottom={24}>
          <Text fontSize={13} fontWeight={700} color={"#6A7282"}>
            Welcome back,
          </Text>
          <Text fontSize={20} fontWeight={700} color={"#263238"}>
            {user?.name?.split(" ")[0]}
          </Text>
        </YStack>

        {/* ── Status pill ── */}
        <XStack
          alignItems="center"
          gap={8}
          marginBottom={Spacing.lg}
          backgroundColor={"#FFF4EC"}
          borderRadius={12}
          borderWidth={1.5}
          borderColor={"#FF6B0033"}
          paddingHorizontal={14}
          paddingVertical={10}
        >
          <View style={styles.statusDot} />
          <Text fontSize={13} fontWeight={600} color={"#FF6B00"}>
            Session dashboard
          </Text>
        </XStack>

        {/* ── No session ── */}
        {(!session ||
          (session.status !== "pending" && session.status !== "active")) && (
          <View style={styles.card}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyCardTitle}>No active requests</Text>
            <Text style={styles.emptyCardSub}>
              Students will appear here when they request a session with you.
            </Text>
          </View>
        )}

        {/* ── Pending request ── */}
        {session?.status === "pending" && (
          <View style={styles.card}>
            {/* Pulse header */}
            <XStack alignItems="center" gap={8} marginBottom={Spacing.md}>
              <View style={styles.pulseDot} />
              <Text
                fontSize={FontSize.xs}
                fontWeight={700}
                color={"#FF6B00"}
                letterSpacing={1}
              >
                NEW SESSION REQUEST
              </Text>
            </XStack>

            <Text
              fontSize={FontSize.lg}
              fontWeight={600}
              color={"#263238"}
              marginBottom={4}
            >
              From{" "}
              <Text color={"#FF6B00"} fontWeight={700}>
                {session.student_email}
              </Text>
            </Text>

            <Text fontSize={FontSize.md} color={"#4A5565"} marginBottom={4}>
              Rate: {formatPaise(session.rate_per_minute_paise)}/min
            </Text>

            <Text
              fontSize={FontSize.sm}
              color={"#6A7282"}
              marginBottom={Spacing.lg}
            >
              Expires at {new Date(session.expires_at).toLocaleTimeString()}
            </Text>

            <Separator alignSelf="stretch" marginBottom={Spacing.lg} />

            {/* Action buttons — match StudentHome "Book" button style */}
            <XStack gap={Spacing.sm}>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={handleDecline}
                activeOpacity={0.8}
              >
                <Text fontSize={FontSize.md} fontWeight={700} color={"#263238"}>
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleAccept}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={"white"} />
                ) : (
                  <XStack alignItems="center" gap={8}>
                    <Text
                      fontSize={FontSize.md}
                      fontWeight={700}
                      color={"white"}
                    >
                      Accept
                    </Text>
                    <AntDesign name="arrow-right" size={14} color="white" />
                  </XStack>
                )}
              </TouchableOpacity>
            </XStack>
          </View>
        )}

        {/* ── Active session ── */}
        {session?.status === "active" && (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              session.sendbird_channel_url
                ? router.push(`/group-channel/${session.sendbird_channel_url}`)
                : router.push("/session/active")
            }
            activeOpacity={0.85}
          >
            {/* Live badge row */}
            <XStack alignItems="center" gap={8} marginBottom={Spacing.md}>
              <View style={styles.liveDot} />
              <Text
                fontSize={FontSize.xs}
                fontWeight={700}
                color={"#22C55E"}
                letterSpacing={2}
              >
                LIVE SESSION
              </Text>
            </XStack>

            <Text
              fontSize={FontSize.lg}
              fontWeight={700}
              color={"#263238"}
              marginBottom={4}
            >
              With {session.student_email}
            </Text>

            <Text
              fontSize={FontSize.sm}
              color={"#6A7282"}
              marginBottom={Spacing.lg}
            >
              Tap to open chat
            </Text>

            <Separator alignSelf="stretch" marginBottom={Spacing.lg} />

            {/* CTA — mirrors Book button exactly */}
            <XStack
              alignSelf="flex-start"
              alignItems="center"
              borderWidth={1.5}
              borderRadius={14}
              paddingVertical={10}
              paddingHorizontal={14}
              backgroundColor={"#FF6B00"}
              gap={10}
            >
              <Text color={"white"} fontWeight={700} fontSize={FontSize.md}>
                Open chat
              </Text>
              <AntDesign name="arrow-right" size={14} color="white" />
            </XStack>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────
export default function HomeTab() {
  const { user } = useAuthStore();
  return user?.role === "student" ? <StudentHome /> : <MentorHome />;
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Shared layout ──
  root: {
    flex: 1,
    backgroundColor: "white",
  },
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

  // ── Search box (StudentHome) ──
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: "#263238",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: "#263238",
  },

  // ── Session banner (StudentHome) ──
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
  sessionBannerArrow: {
    fontSize: FontSize.lg,
    color: Colors.accent,
  },

  // ── MentorCard (StudentHome) ──
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#263238",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
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

  // ── Empty list text (StudentHome) ──
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },

  // ── MentorHome: status pill dot ──
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B00",
  },

  // ── MentorHome: empty state (inside card) ──
  emptyEmoji: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: "#263238",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyCardSub: {
    fontSize: FontSize.sm,
    color: "#6A7282",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── MentorHome: pending dots ──
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B00",
  },

  // ── MentorHome: action buttons ──
  declineBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#263238",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  acceptBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── MentorHome: live dot ──
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
});
