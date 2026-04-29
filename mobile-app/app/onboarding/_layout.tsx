import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="student-signup" />
      <Stack.Screen name="student-signin" />
      <Stack.Screen name="mentor-signup" />
      <Stack.Screen name="mentor-signin" />
    </Stack>
  );
}
