// components/onboarding/steps/StepBranch.tsx
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Mathematics & Computing",
  "Physics",
  "Chemistry",
  "Economics",
  "Management",
  "Commerce",
  "Literature",
  "Law",
  "Medicine",
  "Other",
];

interface Props {
  branch: string;
  setBranch: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
}

export function StepBranch({
  branch,
  setBranch,
  onBack,
  onContinue,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <OnboardingLayout
      step={7}
      onBack={onBack}
      onContinue={onContinue}
      continueLabel={loading ? "Creating account..." : "Continue →"}
      continueDisabled={!branch || loading}
    >
      <YStack flex={1}>
        <YStack marginBottom={32}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            What's your{"\n"}
            <Text fontWeight="700" color="#263238">
              branch
            </Text>
            <Text fontWeight="300">?</Text>
          </Text>
        </YStack>

        <Text style={styles.label}>BRANCH OR MAJOR</Text>

        {/* Dropdown trigger */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownText, !branch && styles.placeholder]}>
            {branch || "Select your branch"}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Picker modal */}
        <Modal visible={open} transparent animationType="slide">
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setOpen(false)}
            activeOpacity={1}
          />
          <YStack
            backgroundColor="white"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            paddingTop={20}
            paddingBottom={40}
            style={styles.sheet}
          >
            <Text style={styles.sheetTitle}>Select Branch</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {BRANCHES.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.option, branch === b && styles.optionSelected]}
                  onPress={() => {
                    setBranch(b);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      branch === b && styles.optionTextSelected,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </YStack>
        </Modal>
      </YStack>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B0B8C1",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#EAEAEA",
    borderRadius: 14,
  },
  dropdownText: {
    fontSize: 17,
    color: "#263238",
    fontWeight: "500",
    flex: 1,
  },
  placeholder: {
    color: "#C0C0C0",
    fontWeight: "400",
  },
  chevron: {
    fontSize: 22,
    color: "#99A1AF",
    transform: [{ rotate: "90deg" }],
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#263238",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  optionSelected: {
    backgroundColor: "#FFF5EE",
  },
  optionText: {
    fontSize: 16,
    color: "#263238",
    fontWeight: "400",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#FF7A00",
  },
});
