import { useAuthStore } from "@/stores/authStore";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const ACTIVE_COLOR = "#263238";
const INACTIVE_COLOR = "#ABABAB";

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = focused ? 2.5 : 2;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InboxIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = focused ? 2.5 : 2;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 12H16L14 15H10L8 12H2"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WalletIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = focused ? 2.5 : 2;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3H8C6.89543 3 6 3.89543 6 5V7H18V5C18 3.89543 17.1046 3 16 3Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 13H18C16.8954 13 16 13.8954 16 15C16 16.1046 16.8954 17 18 17H22"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  const sw = focused ? 2.5 : 2;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.9997 20.9992V18.9992C18.9997 17.9383 18.5783 16.9209 17.8282 16.1707C17.078 15.4206 16.0606 14.9992 14.9997 14.9992H8.99973C7.93886 14.9992 6.92144 15.4206 6.1713 16.1707C5.42115 16.9209 4.99973 17.9383 4.99973 18.9992V20.9992"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.9996 10.9998C14.2087 10.9998 15.9996 9.20899 15.9996 6.99985C15.9996 4.79071 14.2087 2.99985 11.9996 2.99985C9.79043 2.99985 7.99957 4.79071 7.99957 6.99985C7.99957 9.20899 9.79043 10.9998 11.9996 10.9998Z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Custom Tab Button ────────────────────────────────────────────────────────

interface TabButtonProps extends React.PropsWithChildren, TabTriggerSlotProps {
  icon: (focused: boolean) => React.ReactNode;
  label: string;
}

const TabButton = React.forwardRef<View, TabButtonProps>(
  ({ isFocused, icon, label, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={styles.tabButton}
        android_ripple={{ color: "transparent" }}
      >
        <View style={styles.iconWrap}>{icon(!!isFocused)}</View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
              fontWeight: isFocused ? "800" : "400",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  },
);
TabButton.displayName = "TabButton";

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const { user } = useAuthStore();
  const isStudent = user?.role === "student";

  if (isStudent) {
    return (
      <Tabs>
        <TabSlot />
        <TabList style={styles.tabList}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={(f) => <HomeIcon focused={f} />} label="Home" />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton icon={(f) => <InboxIcon focused={f} />} label="Inbox" />
          </TabTrigger>
          <TabTrigger name="wallet" href="/wallet" asChild>
            <TabButton
              icon={(f) => <WalletIcon focused={f} />}
              label="Wallet"
            />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton
              icon={(f) => <ProfileIcon focused={f} />}
              label="Profile"
            />
          </TabTrigger>
        </TabList>
      </Tabs>
    );
  }

  // Mentor — 3 tabs
  return (
    <Tabs>
      <TabSlot />
      <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon={(f) => <HomeIcon focused={f} />} label="Home" />
        </TabTrigger>
        <TabTrigger name="wallet" href="/wallet" asChild>
          <TabButton
            icon={(f) => <WalletIcon focused={f} />}
            label="Earnings"
          />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton
            icon={(f) => <ProfileIcon focused={f} />}
            label="Profile"
          />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabList: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 2,
    borderTopColor: ACTIVE_COLOR, // #263238
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    height: Platform.OS === "ios" ? 88 : 68,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
