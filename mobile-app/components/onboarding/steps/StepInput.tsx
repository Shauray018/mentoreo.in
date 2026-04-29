// components/onboarding/StepInput.tsx
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "tamagui";

interface StepInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function StepInput({ label, error, ...rest }: StepInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor="#C0C0C0"
        {...rest}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
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
  inputError: {
    borderWidth: 1.5,
    borderColor: "#FF4444",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 5,
  },
});
