import { Colors } from "@/constants/theme";
import { platformServices } from "@/services/platformServices";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SendbirdUIKitContainer,
  useConnection,
} from "@sendbird/uikit-react-native";
import { defaultConfig } from "@tamagui/config/v5";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";

const config = createTamagui(defaultConfig);

type Conf = typeof config;

export const unstable_settings = {
  anchor: "signin",
};

function AppNavigator() {
  const user = useAuthStore((s) => s.user);
  const startPolling = useSessionStore((s) => s.startPolling);
  const stopPolling = useSessionStore((s) => s.stopPolling);

  useEffect(() => {
    if (user?.token) {
      startPolling(user.token);
    } else {
      stopPolling();
    }
  }, [user?.token]);

  return (
    <>
      {!user ? <Redirect href="/onboarding" /> : <Redirect href="/(tabs)" />}

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="mentor/[email]"
          options={{ presentation: "card" }}
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
          options={{ presentation: "card" }}
        />
        <Stack.Screen name="test" />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}

// function SendbirdWrapper({ children }: { children: React.ReactNode }) {
//   const colorScheme = useColorScheme();
//   if (Platform.OS === "web") return <>{children}</>;
//   return (
//     <SendbirdUIKitContainer
//       appId={"46534DCE-0862-4A51-8AD5-5461C2551E2D"}
//       chatOptions={{ localCacheStorage: AsyncStorage }}
//       platformServices={platformServices!}
//     >
//       {children}
//     </SendbirdUIKitContainer>
//   );
// }
function SendbirdWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SendbirdUIKitContainer
      appId={"46534DCE-0862-4A51-8AD5-5461C2551E2D"}
      chatOptions={{
        localCacheStorage: AsyncStorage,
      }}
      platformServices={platformServices!}
    >
      <SendbirdConnector>{children}</SendbirdConnector>
    </SendbirdUIKitContainer>
  );
}

function SendbirdConnector({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { connect, disconnect } = useConnection();

  useEffect(() => {
    if (!user) {
      disconnect().catch((e) =>
        console.error("💥 Sendbird disconnect failed:", e),
      );
      return;
    }

    connect(String(user.id), { nickname: user.name }).catch((e) =>
      console.error("💥 Sendbird root connect failed:", e),
    );
  }, [connect, disconnect, user?.id, user?.name]);

  return <>{children}</>;
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
      <TamaguiProvider config={config} defaultTheme="light">
        <AppNavigator />
      </TamaguiProvider>
    </SendbirdWrapper>
  );
}
