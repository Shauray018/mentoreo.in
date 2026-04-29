// import { ChannelPreviewCell } from "@/components/chatList/ChannelPreviewCell";
// import { CustomHeader } from "@/components/chatList/CustomHeader";
// import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
// import { useAuthStore } from "@/stores/authStore";
// import {
//   createGroupChannelListFragment,
//   useSendbirdChat,
// } from "@sendbird/uikit-react-native";
// import { router } from "expo-router";
// import { useEffect, useState } from "react";
// import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// // ─── Fragment — module level ───────────────────────────────────────────────
// const GroupChannelListFragment = createGroupChannelListFragment({
//   Header: CustomHeader,
// });

// // ─── Chat Tab ─────────────────────────────────────────────────────────────
// export default function ChatTab() {
//   const user = useAuthStore((s) => s.user);
//   const { sdk } = useSendbirdChat();
//   const [sdkReady, setSdkReady] = useState(!!sdk?.currentUser);

//   useEffect(() => {
//     if (!sdk || !user?.id) return;
//     if (sdk.currentUser) {
//       setSdkReady(true);
//       return;
//     }
//     let cancelled = false;
//     sdk
//       .connect(String(user.id))
//       .then(() => {
//         if (!cancelled) setSdkReady(true);
//       })
//       .catch((e) => console.error("💥 [chat-tab] reconnect failed:", e));
//     return () => {
//       cancelled = true;
//     };
//   }, [sdk, user?.id]);

//   if (!sdkReady) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator color={Colors.accent} size="large" />
//         <Text style={styles.connectingText}>Connecting to chat…</Text>
//       </View>
//     );
//   }

//   const currentUserId = sdk.currentUser?.userId ?? "";

//   return (
//     <View style={styles.root}>
//       <GroupChannelListFragment
//         onPressCreateChannel={() => {}}
//         onPressChannel={(channel) =>
//           router.push(`/group-channel/${channel.url}`)
//         }
//         renderGroupChannelPreview={({ channel, onPress }) => (
//           <ChannelPreviewCell
//             channel={channel}
//             onPress={onPress}
//             currentUserId={currentUserId}
//           />
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: Colors.bg },
//   centered: {
//     flex: 1,
//     backgroundColor: Colors.bg,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: Spacing.sm,
//   },
//   connectingText: { fontSize: FontSize.sm, color: Colors.textMuted },
//   header: {
//     paddingTop: 60,
//     paddingHorizontal: Spacing.md,
//     paddingBottom: Spacing.md,
//     backgroundColor: Colors.bg,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//   },
//   headerTitle: {
//     fontSize: FontSize.xl,
//     fontWeight: "800",
//     color: Colors.textPrimary,
//   },
//   cell: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.border,
//     backgroundColor: Colors.bg,
//   },
//   avatarWrap: { marginRight: 12 },
//   avatar: { width: 48, height: 48, borderRadius: 24 },
//   avatarFallback: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: Colors.accentDim,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1.5,
//     borderColor: Colors.accent + "44",
//   },
//   avatarInitial: {
//     fontSize: FontSize.lg,
//     fontWeight: "700",
//     color: Colors.accent,
//   },
//   cellBody: { flex: 1 },
//   cellTopRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 3,
//   },
//   cellName: {
//     fontSize: FontSize.md,
//     fontWeight: "700",
//     color: Colors.textPrimary,
//     flex: 1,
//     marginRight: 8,
//   },
//   cellTime: { fontSize: FontSize.xs, color: Colors.textMuted },
//   cellBottomRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cellPreview: {
//     fontSize: FontSize.sm,
//     color: Colors.textSecondary,
//     flex: 1,
//     marginRight: 8,
//   },
//   unreadBadge: {
//     backgroundColor: Colors.accent,
//     borderRadius: Radius.full,
//     minWidth: 20,
//     height: 20,
//     paddingHorizontal: 5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   unreadText: { fontSize: FontSize.xs, fontWeight: "800", color: Colors.bg },
// });
// app/(tabs)/chat.tsx

import { ChannelPreviewCell } from "@/components/chatList/ChannelPreviewCell";
import { CustomHeader } from "@/components/chatList/CustomHeader";
import { Colors, FontSize, Spacing } from "@/constants/theme";
import {
  createGroupChannelListFragment,
  useSendbirdChat,
} from "@sendbird/uikit-react-native";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const GroupChannelListFragment = createGroupChannelListFragment({
  Header: CustomHeader,
});

export default function ChatTab() {
  const { sdk } = useSendbirdChat();

  if (!sdk?.currentUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
        <Text style={styles.connectingText}>Connecting to chat…</Text>
      </View>
    );
  }

  const currentUserId = sdk.currentUser.userId;

  return (
    <View style={styles.root}>
      <GroupChannelListFragment
        onPressCreateChannel={() => {}}
        onPressChannel={(channel) =>
          router.push(`/group-channel/${channel.url}`)
        }
        renderGroupChannelPreview={({ channel, onPress }) => (
          <ChannelPreviewCell
            channel={channel}
            onPress={onPress}
            currentUserId={currentUserId}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  connectingText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
