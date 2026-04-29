// components/onboarding/steps/StepPhone.tsx
import { Text, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";
import { StepInput } from "./StepInput";

interface Props {
  phone: string;
  setPhone: (v: string) => void;
  error: string;
  onBack: () => void;
  onContinue: () => void;
}

export function StepPhone({
  phone,
  setPhone,
  error,
  onBack,
  onContinue,
}: Props) {
  return (
    <OnboardingLayout
      step={4}
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!phone.trim()}
    >
      <YStack flex={1}>
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            Your{"\n"}
            <Text fontWeight="700" color="#263238">
              WhatsApp no.
            </Text>
          </Text>
        </YStack>

        <StepInput
          label="WHATSAPP NUMBER"
          placeholder="+91 98765 43210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          error={error}
        />
      </YStack>
    </OnboardingLayout>
  );
}
