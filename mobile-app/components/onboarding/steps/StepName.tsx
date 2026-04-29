// components/onboarding/steps/StepName.tsx
import { Text, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";
import { StepInput } from "./StepInput";

interface Props {
  firstName: string;
  lastName: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  error: string;
  onBack: () => void;
  onContinue: () => void;
}

export function StepName({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  error,
  onBack,
  onContinue,
}: Props) {
  return (
    <OnboardingLayout
      step={3}
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!firstName.trim()}
    >
      <YStack flex={1}>
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            What's your{"\n"}
            <Text fontWeight="700" color="#263238">
              name
            </Text>
            <Text fontWeight="300">?</Text>
          </Text>
        </YStack>

        <StepInput
          label="FIRST NAME"
          placeholder="Jane"
          value={firstName}
          onChangeText={setFirstName}
          autoComplete="given-name"
        />

        <StepInput
          label="LAST NAME"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
          autoComplete="family-name"
          error={error}
        />
      </YStack>
    </OnboardingLayout>
  );
}
