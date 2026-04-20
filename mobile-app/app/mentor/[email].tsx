import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import {
  MentorProfile,
  mentorsApi,
  sessionsApi,
  tierColor,
} from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MentorDetailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { user } = useAuthStore();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  useEffect(() => {
    mentorsApi
      .getByEmail(decodeURIComponent(email))
      .then(setMentor)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  const handleRequest = async () => {
    if (!mentor || !user) return;
    if (!mentor.is_available) {
      Alert.alert("Unavailable", "This mentor is currently unavailable.");
      return;
    }

    Alert.alert(
      "Request Session",
      `Start a session with ${mentor.display_name}?\n\nRate: ₹${mentor.rate_per_minute}/min\nMinimum 1 minute charge applies.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: async () => {
            setRequesting(true);
            try {
              console.log(mentor.email);
              console.log("user token: ", user.token);
              await sessionsApi.request(mentor.email, user.token);
              router.push("/session/active");
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not request session");
            } finally {
              setRequesting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!mentor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Mentor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {mentor.avatar_url ? (
              <Image
                source={{ uri: mentor.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {mentor.display_name?.[0]?.toUpperCase() ?? "M"}
                </Text>
              </View>
            )}
            {mentor.is_available && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{mentor.display_name}</Text>
          <Text style={styles.college}>
            {mentor.college} · {mentor.course} · {mentor.year}
          </Text>

          <View style={styles.metaRow}>
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
            {mentor.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Rate */}
        <View style={styles.rateCard}>
          <Text style={styles.rateLabel}>Session Rate</Text>
          <Text style={styles.rateValue}>
            ₹{mentor.rate_per_minute}
            <Text style={styles.ratePer}>/min</Text>
          </Text>
          <Text style={styles.rateSub}>
            Minimum 1 minute · Billed at session end
          </Text>
        </View>

        {/* Bio */}
        {mentor.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bodyText}>{mentor.bio}</Text>
          </View>
        ) : null}

        {/* Approach */}
        {mentor.approach ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teaching Approach</Text>
            <Text style={styles.bodyText}>{mentor.approach}</Text>
          </View>
        ) : null}

        {/* Tags */}
        {mentor.expertise_tags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise</Text>
            <View style={styles.tagsWrap}>
              {mentor.expertise_tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for the sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[
            styles.requestBtn,
            !mentor.is_available && styles.requestBtnDisabled,
            requesting && { opacity: 0.7 },
          ]}
          onPress={handleRequest}
          disabled={requesting || !mentor.is_available}
          activeOpacity={0.85}
        >
          {requesting ? (
            <ActivityIndicator color={Colors.bg} />
          ) : (
            <Text style={styles.requestBtnText}>
              {mentor.is_available
                ? `Request Session · ₹${mentor.rate_per_minute}/min`
                : "Currently Unavailable"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg,
  },
  errorText: { fontSize: FontSize.md, color: Colors.textMuted },
  content: { paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: 32 },

  backBtn: { marginBottom: Spacing.md },
  backBtnText: { fontSize: FontSize.sm, color: Colors.accent },

  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  avatarWrap: { alignItems: "center", marginBottom: Spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 28 },
  avatarFallback: {
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    color: Colors.accent,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.success + "22",
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 5,
  },
  availableText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.success,
  },

  name: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  college: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaRow: { flexDirection: "row", gap: 8 },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tierText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  verifiedBadge: {
    backgroundColor: Colors.accent + "22",
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.accent,
  },

  rateCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: "center",
  },
  rateLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    color: Colors.accent,
  },
  ratePer: {
    fontSize: FontSize.lg,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  rateSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },

  section: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingBottom: 36,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  requestBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  requestBtnDisabled: {
    backgroundColor: Colors.bgElevated,
  },
  requestBtnText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.bg,
  },
});
