import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, YStack } from "tamagui";
import { OtpInput } from "../otp-input"; // your existing component — untouched
import { OnboardingLayout } from "./OnboardingLayout";

interface Props {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  onResend: () => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
  error: string;
}

export function StepOtp({
  email,
  otp,
  setOtp,
  onResend,
  onBack,
  onContinue,
  loading,
  error,
}: Props) {
  return (
    <OnboardingLayout
      step={2}
      onBack={onBack}
      onContinue={onContinue}
      continueLabel={loading ? "Verifying..." : "Continue →"}
      continueDisabled={loading || otp.length < 6}
    >
      <YStack flex={1}>
        {/* Title */}
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            Check your{"\n"}
            <Text fontWeight="700" color="#263238">
              email
            </Text>
          </Text>
          <Text marginTop={8} fontSize={14} fontWeight="300" color="#7A7A7A">
            We've sent a 6-digit code to{" "}
            <Text fontSize={14} fontWeight="600" color="#263238">
              {email}
            </Text>
            .
          </Text>
        </YStack>

        {/* OTP — your existing component, untouched */}
        <OtpInput value={otp} onChange={setOtp} />

        {!!error && (
          <Text style={styles.errorText} marginTop={8}>
            {error}
          </Text>
        )}

        {/* Resend */}
        <TouchableOpacity onPress={onResend} style={{ marginTop: 16 }}>
          <Text fontSize={14} fontWeight="300" color="#7A7A7A">
            Didn't receive it?{" "}
            <Text fontSize={14} fontWeight="700" color="#263238">
              Resend Code
            </Text>
          </Text>
        </TouchableOpacity>
      </YStack>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  errorText: { color: "#FF4444", fontSize: 13 },
});
