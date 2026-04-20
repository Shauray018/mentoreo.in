import { Colors, FontSize } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

// Simple SVG-free icons using Unicode / text-based approach
function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: focused ? Colors.accentDim : "transparent",
      }}
    >
      <View>
        {/* We use emoji as tab icons — clean and cross-platform */}
        <View style={{ opacity: focused ? 1 : 0.5 }}>
          {/* Placeholder — icons passed as children */}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const tabBarStyle = {
    backgroundColor: Colors.bgCard,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === "ios" ? 84 : 64,
  };

  const screenOptions = {
    headerShown: false,
    tabBarStyle,
    tabBarActiveTintColor: Colors.accent,
    tabBarInactiveTintColor: Colors.textMuted,
    tabBarLabelStyle: {
      fontSize: FontSize.xs,
      fontWeight: "600" as const,
      marginTop: 2,
    },
  };

  if (isStudent) {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Explore",
            tabBarIcon: ({ focused }) => (
              <TabIconEmoji emoji="🔭" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chats",
            tabBarIcon: ({ focused }) => (
              <TabIconEmoji emoji="💬" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: ({ focused }) => (
              <TabIconEmoji emoji="💳" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabIconEmoji emoji="👤" focused={focused} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // Mentor tabs
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Requests",
          tabBarIcon: ({ focused }) => (
            <TabIconEmoji emoji="📥" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused }) => (
            <TabIconEmoji emoji="💬" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Earnings",
          tabBarIcon: ({ focused }) => (
            <TabIconEmoji emoji="💰" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIconEmoji emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIconEmoji({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: focused ? Colors.accentDim : "transparent",
      }}
    >
      <View style={{ opacity: focused ? 1 : 0.55 }}>
        <TabEmojiText emoji={emoji} />
      </View>
    </View>
  );
}

function TabEmojiText({ emoji }: { emoji: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 16 }}>{emoji}</Text>;
}
