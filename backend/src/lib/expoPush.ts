// ─── lib/expoPush.ts ──────────────────────────────────────────────────────────
// Sends Expo push notifications directly via Expo's push API.
// This is completely separate from Sendbird — Sendbird handles in-app chat
// messages, this handles device push notifications.

export interface ExpoPushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  badge?: number;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  badge?: number;
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

/**
 * Send a push notification to a single Expo push token.
 * Returns true if Expo accepted it (status "ok"), false otherwise.
 */
export async function sendExpoPush(
  expoPushToken: string,
  payload: ExpoPushPayload,
): Promise<boolean> {
  if (!expoPushToken?.startsWith("ExponentPushToken[")) {
    console.warn("sendExpoPush: invalid token format:", expoPushToken);
    return false;
  }

  const message: ExpoMessage = {
    to: expoPushToken,
    sound: "default",
    ...payload,
  };

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      console.error("Expo push HTTP error:", res.status, await res.text());
      return false;
    }

    const json = await res.json();
    const ticket: ExpoTicket = json?.data;

    if (ticket?.status === "error") {
      console.error("Expo push ticket error:", ticket.message, ticket.details);
      return false;
    }

    return ticket?.status === "ok";
  } catch (err) {
    console.error("sendExpoPush exception:", err);
    return false;
  }
}

/**
 * Look up the Expo push token for a given user email + role,
 * then send them a push notification.
 *
 * role: "student" → looks in student_signups
 * role: "mentor"  → looks in signups
 *
 * Returns true if the push was sent successfully.
 */
export async function pushToUser(
  supabase: any,
  userEmail: string,
  payload: ExpoPushPayload,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("expo_push_tokens")
    .select("token")
    .eq("email", userEmail)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("pushToUser: failed to fetch token for", userEmail, error);
    return false;
  }

  if (!data?.token) {
    console.warn("pushToUser: no push token registered for", userEmail);
    return false;
  }

  return sendExpoPush(data.token, payload);
}
