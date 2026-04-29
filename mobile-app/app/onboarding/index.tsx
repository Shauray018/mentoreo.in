import RoleCard, { RoleType } from "@/components/onboarding/roleCard";
import { useAuthStore } from "@/stores/authStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Strong, Text, YStack } from "tamagui";

export default function OnboardingHome() {
  const user = useAuthStore((s) => s.user);
  const [selectedRole, setSelectedRole] = useState<RoleType>("student");
  const router = useRouter();

  if (user) return <Redirect href="/(tabs)" />;

  function handleRouting() {
    if (selectedRole === "student") {
      router.push("/onboarding/student-signin");
    } else {
      router.push("/onboarding/mentor-signin");
    }
  }

  return (
    <YStack flex={1} justifyContent="space-evenly">
      <YStack paddingTop={30}>
        <Text textAlign="center" fontSize={26}>
          How would you like to
        </Text>
        <Strong fontSize={26} textAlign="center">
          continue your journey?
        </Strong>
      </YStack>
      <YStack padding={20} gap={12}>
        <RoleCard
          role="student"
          selected={selectedRole === "student"}
          onPress={() => setSelectedRole("student")}
        />

        <RoleCard
          role="mentor"
          selected={selectedRole === "mentor"}
          onPress={() => setSelectedRole("mentor")}
        />
      </YStack>
      <Button
        alignSelf="center"
        width={"90%"}
        marginHorizontal={10}
        backgroundColor="#263238"
        height={60}
        onPress={() => {
          handleRouting();
        }}
      >
        <Text fontWeight={600} fontSize={17} color={"white"}>
          Continue
        </Text>
        <AntDesign name="arrow-right" size={17} color="white" />
      </Button>
    </YStack>
  );
}
