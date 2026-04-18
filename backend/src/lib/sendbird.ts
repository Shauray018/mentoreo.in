// Sendbird Platform API helpers
const SENDBIRD_BASE = `https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3`;
const SB_HEADERS = {
  "Content-Type": "application/json",
  "Api-Token": process.env.SENDBIRD_API_TOKEN!,
};

// Send a push notification to a specific user via a Sendbird message
// The UIKit + expo-notifications pipeline delivers this to the device
export async function sendPushToUser(
  targetUserId: string,
  senderId: string,
  message: string,
  customData?: Record<string, string>
) {
  const res = await fetch(`${SENDBIRD_BASE}/users/${targetUserId}/push`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({
      message,
      send_push: true,
      custom_type: "session_notification",
      data: JSON.stringify(customData ?? {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Sendbird push error:", err);
  }
}

// Create a private 1:1 group channel between student and mentor
export async function createSessionChannel(
  studentId: string,
  mentorId: string,
  sessionId: string
): Promise<string | null> {
  const res = await fetch(`${SENDBIRD_BASE}/group_channels`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({
      channel_url: `session_${sessionId}`,  // deterministic URL
      name: `Session ${sessionId}`,
      user_ids: [studentId, mentorId],
      is_distinct: false,                   // new channel every session
      custom_type: "mentoreo_session",
      data: JSON.stringify({ sessionId }),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Sendbird channel create error:", err);
    return null;
  }

  const data = await res.json();
  return data.channel_url as string;
}

// Delete a channel when session ends
export async function deleteSessionChannel(channelUrl: string) {
  await fetch(`${SENDBIRD_BASE}/group_channels/${channelUrl}`, {
    method: "DELETE",
    headers: SB_HEADERS,
  });
}