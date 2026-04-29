// components/onboarding/steps/StepCourse.tsx
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { OnboardingLayout } from "./OnboardingLayout";

const COURSES = ["B.Tech", "MBBS", "BBA", "BA", "B.COM"];
const ORANGE = "#FF7A00";

interface Props {
  course: string;
  setCourse: (v: string) => void;
  customCourse: string;
  setCustomCourse: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function StepCourse({
  course,
  setCourse,
  customCourse,
  setCustomCourse,
  onBack,
  onContinue,
}: Props) {
  const isOther = course === "Other";
  const isValid = isOther ? customCourse.trim().length > 0 : !!course;

  return (
    <OnboardingLayout
      step={6}
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!isValid}
    >
      <YStack flex={1}>
        <YStack marginBottom={28}>
          <Text color="#263238" fontSize={36} fontWeight="300">
            What's your{"\n"}
            <Text fontWeight="700" color="#263238">
              course
            </Text>
            <Text fontWeight="300">?</Text>
          </Text>
        </YStack>

        {/* Course chips grid */}
        <XStack flexWrap="wrap" gap={12} marginBottom={20}>
          {COURSES.map((c) => {
            const selected = course === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCourse(c)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Other chip */}
          <TouchableOpacity
            style={[styles.chip, isOther && styles.chipOtherSelected]}
            onPress={() => setCourse("Other")}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, isOther && styles.chipTextOrange]}>
              Other
            </Text>
          </TouchableOpacity>
        </XStack>

        {/* Custom input — shown when "Other" is selected */}
        {isOther && (
          <YStack>
            <Text style={styles.label}>CUSTOM COURSE NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. B.Arch, PhD..."
              placeholderTextColor="#C0C0C0"
              value={customCourse}
              onChangeText={setCustomCourse}
              autoCapitalize="words"
            />
          </YStack>
        )}
      </YStack>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#EAEAEA",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: "44%",
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: "#EAEAEA",
    borderColor: "#263238",
  },
  chipOtherSelected: {
    backgroundColor: "#FFF0E5",
    borderColor: ORANGE,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#263238",
  },
  chipTextSelected: {
    fontWeight: "700",
  },
  chipTextOrange: {
    color: ORANGE,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B0B8C1",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    padding: 16,
    fontSize: 17,
    color: "#263238",
    backgroundColor: "#EAEAEA",
    fontWeight: "500",
    borderRadius: 14,
  },
});
