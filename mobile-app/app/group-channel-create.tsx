import { createGroupChannelCreateFragment } from "@sendbird/uikit-react-native";
import { useRouter } from "expo-router";

const GroupChannelCreateFragment = createGroupChannelCreateFragment();

export default function GroupChannelCreateScreen() {
  const router = useRouter();

  return (
    <GroupChannelCreateFragment
      onCreateChannel={async (channel) => {
        router.replace({
          pathname: "/group-channel/[channelUrl]",
          params: { channelUrl: channel.url },
        });
      }}
      onPressHeaderLeft={() => router.back()}
    />
  );
}
