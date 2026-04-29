// components/onboarding/steps/StepEmail.tsx
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";
import { StepInput } from "./StepInput";

interface Props {
  email: string;
  setEmail: (v: string) => void;
  error: string;
  loading: boolean;
  onContinue: () => void;
}

export function StepEmail({
  email,
  setEmail,
  error,
  loading,
  onContinue,
}: Props) {
  return (
    <OnboardingLayout
      step={1}
      onBack={() => router.back()}
      onContinue={onContinue}
      continueLabel={loading ? "Sending..." : "Continue →"}
      continueDisabled={loading}
    >
      <YStack flex={1}>
        {/* Title */}
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            What's your{"\n"}
            <Text fontWeight="700" color="#263238">
              email
            </Text>
            <Text fontWeight="300">?</Text>
          </Text>
          <Text marginTop={8} fontSize={14} fontWeight="300" color="#7A7A7A">
            Preferably your college email address.
          </Text>
        </YStack>

        <StepInput
          label="EMAIL ADDRESS"
          placeholder="hello@mentoreo.in"
          value={email}
          onChangeText={(t) => setEmail(t)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          error={error}
        />

        {/* Sign in link */}
        <XStack gap={4} alignItems="center" marginTop={8}>
          <Text fontSize={14} color="#7A7A7A" fontWeight="300">
            Already a mentor?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/onboarding/mentor-signin")}
          >
            <Text fontSize={14} color="#263238" fontWeight="700">
              Sign in
            </Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
    </OnboardingLayout>
  );
}
