import { SendbirdGroupChannel } from "@sendbird/uikit-utils";

export function getMentorEmail(channel: SendbirdGroupChannel): string | null {
  try {
    if (!channel.data || channel.data.length === 0) return null;
    const parsed = JSON.parse(channel.data);
    return parsed?.mentorEmail ?? null;
  } catch {
    return null;
  }
}
