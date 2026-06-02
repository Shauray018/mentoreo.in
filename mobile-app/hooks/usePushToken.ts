// hooks/usePushToken.ts
// Requests notification permissions, gets the Expo push token, and registers
// it with the backend. Call this once after the user is confirmed logged in.

import { useAuthStore } from "@/stores/authStore";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
const API_BASE = process.env.API_URL ?? "https://mentoreo-in.onrender.com";

async function registerTokenWithBackend(
  token: string,
  authToken: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/push-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`push-token registration failed: ${res.status} ${body}`);
  }
}

async function getExpoPushToken(): Promise<string | null> {
  // Push tokens only work on physical devices
  if (!Device.isDevice) {
    console.warn("usePushToken: push notifications require a physical device");
    return null;
  }

  // Android needs a notification channel set before requesting permission
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#742DDD",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("usePushToken: notification permission denied");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    // projectId is required for EAS — get yours from app.json > extra.eas.projectId
    // or from https://expo.dev/accounts/<your-account>/projects/<your-project>
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });

  return tokenData.data; // "ExponentPushToken[xxxx]"
}

/**
 * usePushToken
 *
 * Automatically requests permission, fetches the Expo push token, and
 * registers it with `/auth/push-token` whenever the logged-in user changes.
 *
 * Safe to call on every render — uses a ref to avoid duplicate requests.
 */
export function usePushToken() {
  const user = useAuthStore((s) => s.user);
  const lastRegisteredEmail = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.token || !user?.email) return;

    // Don't re-register if we already did it for this user in this session
    if (lastRegisteredEmail.current === user.email) return;

    (async () => {
      try {
        const pushToken = await getExpoPushToken();
        if (!pushToken) return;

        await registerTokenWithBackend(pushToken, user.token);
        lastRegisteredEmail.current = user.email;
        console.log("✅ Push token registered for", user.email);
      } catch (err) {
        // Non-fatal — app works without push tokens, just silently degrades
        console.error("usePushToken: failed to register token:", err);
      }
    })();
  }, [user?.token, user?.email]);
}
