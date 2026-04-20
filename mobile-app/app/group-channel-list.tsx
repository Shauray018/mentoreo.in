import { createGroupChannelListFragment } from "@sendbird/uikit-react-native";
import { useRouter } from "expo-router";

const GroupChannelListFragment = createGroupChannelListFragment();

export default function GroupChannelListScreen() {
  const router = useRouter();

  return (
    <GroupChannelListFragment
      onPressCreateChannel={(channelType) => {
        router.push({
          pathname: "/group-channel-create",
          params: { channelType },
        });
      }}
      onPressChannel={(channel) => {
        router.push({
          pathname: "/group-channel/[channelUrl]",
          params: { channelUrl: channel.url },
        });
      }}
    />
  );
}
