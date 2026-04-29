// components/onboarding/steps/StepCollege.tsx
import { Text, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";
import { StepInput } from "./StepInput";

interface Props {
  college: string;
  setCollege: (v: string) => void;
  error: string;
  onBack: () => void;
  onContinue: () => void;
}

export function StepCollege({
  college,
  setCollege,
  error,
  onBack,
  onContinue,
}: Props) {
  return (
    <OnboardingLayout
      step={5}
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!college.trim()}
    >
      <YStack flex={1}>
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            Where do you{"\n"}
            <Text fontWeight="700" color="#263238">
              study
            </Text>
            <Text fontWeight="300">?</Text>
          </Text>
        </YStack>

        <StepInput
          label="COLLEGE NAME"
          placeholder="e.g. Anna University"
          value={college}
          onChangeText={setCollege}
          autoCapitalize="words"
          error={error}
        />
      </YStack>
    </OnboardingLayout>
  );
}
