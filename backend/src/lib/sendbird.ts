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
    const text = await res.text(); // ← use text() not json()
    if (text) {
      try {
        const err = JSON.parse(text);
        console.error("Sendbird push error:", err);
      } catch {
        console.error("Sendbird push error (raw):", text);
      }
    }
  }
}

// Create a private 1:1 group channel between student and mentor
export async function createSessionChannel(
  studentId: string,
  mentorId: string,
  sessionId: string,
  mentorEmail: string
): Promise<string | null> {
  const channelData = {
    sessionId,
    studentId,
    mentorId,
    mentorEmail,
    state: "active",
  };

  const res = await fetch(`${SENDBIRD_BASE}/group_channels`, {
    method: "POST",
    headers: SB_HEADERS,
    body: JSON.stringify({
      channel_url: `session_${sessionId}`,  // deterministic URL
      name: `Session ${sessionId}`,
      user_ids: [studentId, mentorId],
      is_distinct: false,                   // new channel every session
      custom_type: "mentoreo_session",
      data: JSON.stringify(channelData),
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

export async function freezeSessionChannel(channelUrl: string): Promise<boolean> {
  const safeChannelUrl = encodeURIComponent(channelUrl);
  const res = await fetch(`${SENDBIRD_BASE}/group_channels/${safeChannelUrl}`, {
    method: "PUT",
    headers: SB_HEADERS,
    body: JSON.stringify({ freeze: true }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Sendbird channel freeze error:", channelUrl, text);
    return false;
  }

  return true;
}

export async function updateSessionChannelState(
  channelUrl: string,
  state: "ended" | "active"
): Promise<boolean> {
  const safeChannelUrl = encodeURIComponent(channelUrl);

  let existingData: Record<string, unknown> = {};
  const getRes = await fetch(`${SENDBIRD_BASE}/group_channels/${safeChannelUrl}`, {
    method: "GET",
    headers: SB_HEADERS,
  });

  if (getRes.ok) {
    const channel = await getRes.json();
    if (typeof channel?.data === "string" && channel.data.length > 0) {
      try {
        const parsed = JSON.parse(channel.data);
        if (parsed && typeof parsed === "object") {
          existingData = parsed as Record<string, unknown>;
        }
      } catch {
        console.error("Sendbird channel data parse error:", channelUrl, channel.data);
      }
    }
  } else {
    const getText = await getRes.text();
    console.error("Sendbird channel fetch error before state update:", channelUrl, getText);
  }

  const updatedData = {
    ...existingData,
    state,
  };

  const putRes = await fetch(`${SENDBIRD_BASE}/group_channels/${safeChannelUrl}`, {
    method: "PUT",
    headers: SB_HEADERS,
    body: JSON.stringify({
      data: JSON.stringify(updatedData),
    }),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    console.error("Sendbird channel state update error:", channelUrl, state, text);
    return false;
  }

  return true;
}
