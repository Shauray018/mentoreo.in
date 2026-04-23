import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import type { SendbirdGroupChannel } from "@sendbird/uikit-utils";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function getPreview(channel: SendbirdGroupChannel): string {
  const msg = channel.lastMessage;
  if (!msg) return "No messages yet";
  if (msg.isUserMessage()) return msg.message ?? "";
  if (msg.isFileMessage()) return "📎 File";
  return "";
}

function formatTime(ts: number): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return isToday
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ChannelPreviewCell({
  channel,
  onPress,
  currentUserId,
}: {
  channel: SendbirdGroupChannel;
  onPress: () => void;
  currentUserId: string;
}) {
  const mentor = useMentorProfile(channel);

  // Fallback to Sendbird member data while mentor profile loads
  const otherMember = channel.members.find((m) => m.userId !== currentUserId);
  const displayName =
    mentor?.display_name ??
    otherMember?.nickname ??
    otherMember?.userId ??
    "Mentor";
  const avatarUrl =
    mentor?.avatar_url && mentor.avatar_url.length > 0
      ? mentor.avatar_url
      : otherMember?.profileUrl && otherMember.profileUrl.length > 0
        ? otherMember.profileUrl
        : null;

  const initial = displayName[0]?.toUpperCase() ?? "M";
  const preview = getPreview(channel);
  const time = formatTime(channel.lastMessage?.createdAt ?? 0);
  const unread = channel.unreadMessageCount;

  return (
    <TouchableOpacity
      style={styles.cell}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.cellBody}>
        <View style={styles.cellTopRow}>
          <Text style={styles.cellName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.cellTime}>{time}</Text>
        </View>
        <View style={styles.cellBottomRow}>
          <Text style={styles.cellPreview} numberOfLines={1}>
            {preview}
          </Text>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  avatarWrap: { marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent + "44",
  },
  avatarInitial: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.accent,
  },
  cellBody: { flex: 1 },
  cellTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  cellName: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cellTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  cellBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cellPreview: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { fontSize: FontSize.xs, fontWeight: "800", color: Colors.bg },
});
