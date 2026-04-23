import { Colors, FontSize, Spacing } from "@/constants/theme";
import { GroupChannelListModule } from "@sendbird/uikit-react-native";
import { Text, View } from "react-native";

export const CustomHeader: GroupChannelListModule["Header"] = () => {
  return (
    <View
      style={{
        paddingTop: 60,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <Text
        style={{
          fontSize: FontSize.xl,
          fontWeight: "800",
          color: Colors.textPrimary,
        }}
      >
        Chats
      </Text>
    </View>
  );
};
