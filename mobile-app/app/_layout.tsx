import { Colors } from "@/constants/theme";
import { platformServices } from "@/services/platformServices";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SendbirdUIKitContainer,
  useSendbirdChat,
} from "@sendbird/uikit-react-native";
import {
  DarkUIKitTheme,
  LightUIKitTheme,
} from "@sendbird/uikit-react-native-foundation";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, View, useColorScheme } from "react-native";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "signin",
};

function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const startPolling = useSessionStore((s) => s.startPolling);
  const stopPolling = useSessionStore((s) => s.stopPolling);
  const { currentUser } = useSendbirdChat();

  // Start/stop the single global session poller based on auth state
  useEffect(() => {
    if (user?.token) {
      startPolling(user.token);
    } else {
      stopPolling();
    }
  }, [user?.token]);

  return (
    <>
      {!user ? <Redirect href="/signin" /> : <Redirect href="/(tabs)" />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="signin" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="mentor/[email]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="session/active"
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="group-channel/[channelUrl]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
      </Stack>

      <StatusBar style="light" />
    </>
  );
}

function SendbirdWrapper({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "light" ? LightUIKitTheme : DarkUIKitTheme;
  if (Platform.OS === "web") return <>{children}</>;
  return (
    <SendbirdUIKitContainer
      styles={{ theme }}
      appId={"46534DCE-0862-4A51-8AD5-5461C2551E2D"}
      chatOptions={{ localCacheStorage: AsyncStorage }}
      platformServices={platformServices!}
    >
      {children}
    </SendbirdUIKitContainer>
  );
}

export default function RootLayout() {
  // Wait for Zustand to rehydrate from AsyncStorage before rendering anything.
  // We do this with a local useState + useEffect instead of relying on the
  // onRehydrateStorage callback, which can silently fail on some RN versions.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // useAuthStore.persist.rehydrate() returns a promise we can await,
    // but the store may already be hydrated synchronously on first call.
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If already hydrated (e.g. second render, or sync storage), set immediately
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsub;
  }, []);

  if (!hydrated) {
    // Blank screen while reading AsyncStorage — only flashes for ~50ms
    return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
  }

  return (
    <SendbirdWrapper>
      <AppNavigator />
    </SendbirdWrapper>
  );
}
