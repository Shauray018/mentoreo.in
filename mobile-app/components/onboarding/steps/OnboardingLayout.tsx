// components/onboarding/OnboardingLayout.tsx
import { ReactNode } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";

const ORANGE = "#FF7A00";
const TOTAL_STEPS = 7;

interface OnboardingLayoutProps {
  step: number; // 1-indexed
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  children: ReactNode;
  scrollable?: boolean; // pass true if parent handles scroll
}

export function OnboardingLayout({
  step,
  onBack,
  onContinue,
  continueLabel = "Continue →",
  continueDisabled = false,
  children,
}: OnboardingLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1} backgroundColor="#F2F2F2">
          {/* Header */}
          <XStack
            paddingHorizontal={20}
            marginTop={60}
            marginBottom={20}
            alignItems="center"
            justifyContent="space-between"
          >
            <Button
              alignSelf="flex-start"
              backgroundColor="white"
              borderRadius={100}
              width={44}
              height={44}
              onPress={onBack}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={22} color="#263238">
                ‹
              </Text>
            </Button>
            <Text
              color="#99A1AF"
              fontSize={11}
              fontWeight="600"
              letterSpacing={1}
            >
              STEP {step} OF {TOTAL_STEPS}
            </Text>
          </XStack>

          {/* Content */}
          <YStack flex={1} paddingHorizontal={24}>
            {children}
          </YStack>

          {/* Continue button — always pinned to bottom */}
          <YStack paddingHorizontal={24} paddingBottom={36} paddingTop={12}>
            <TouchableOpacity
              style={[styles.continueBtn, continueDisabled && { opacity: 0.5 }]}
              onPress={onContinue}
              disabled={continueDisabled}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>{continueLabel}</Text>
            </TouchableOpacity>
          </YStack>
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  continueBtn: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
