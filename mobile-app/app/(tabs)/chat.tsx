import { Colors, FontSize, Spacing } from "@/constants/theme";
import {
    createGroupChannelListFragment,
    useSendbirdChat,
} from "@sendbird/uikit-react-native";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const GroupChannelListFragment = createGroupChannelListFragment();

export default function ChatTab() {
  const { currentUser } = useSendbirdChat();

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.label}>Not connected to chat</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <GroupChannelListFragment
        onPressCreateChannel={() => {}}
        onPressChannel={(channel) => {
          router.push(`/group-channel/${channel.url}`);
        }}
      />
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
  label: { fontSize: FontSize.md, color: Colors.textMuted },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
});
