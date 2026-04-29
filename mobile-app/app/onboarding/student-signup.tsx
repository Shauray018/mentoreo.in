// StudentSignup.tsx
import { OtpInput } from "@/components/onboarding/otp-input";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";

const ORANGE = "#FF7A00";

export default function StudentSignup() {
  const signIn = useAuthStore((s) => s.signIn);

  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authApi.sendSignupOtp(email.trim(), "student");
      setStep("details");
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!otp || !name.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await authApi.signupStudent({
        email: email.trim(),
        otp,
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      signIn({ ...res.user, token: res.token });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1} backgroundColor={"#ECECEC"} paddingHorizontal={20}>
          {/* Back button */}
          <Button
            alignSelf="flex-start"
            backgroundColor={"white"}
            borderRadius={100}
            onPress={() =>
              step === "details" ? setStep("email") : router.back()
            }
            marginTop={70}
            marginBottom={30}
          >
            <Text fontSize={22}>‹</Text>
          </Button>

          {/* Header */}
          <YStack>
            {step === "email" ? (
              <>
                <Text fontSize={40} fontWeight={300}>
                  Create your
                </Text>
                <XStack>
                  <Text fontSize={40} fontWeight={600} color={"#FF8000"}>
                    Account
                  </Text>
                  <Text fontSize={40} fontWeight={600}>
                    .
                  </Text>
                </XStack>
                <Text
                  paddingTop={5}
                  fontSize={15}
                  fontWeight={300}
                  color="#7A7A7A"
                >
                  Enter your email to get started.
                </Text>
              </>
            ) : (
              <>
                <Text fontSize={40} fontWeight={300}>
                  Almost
                </Text>
                <XStack>
                  <Text fontSize={40} fontWeight={600} color={"#FF8000"}>
                    There
                  </Text>
                  <Text fontSize={40} fontWeight={600}>
                    .
                  </Text>
                </XStack>
                <Text
                  paddingTop={5}
                  fontSize={15}
                  fontWeight={300}
                  color="#7A7A7A"
                >
                  Verify your email and fill in your details.
                </Text>
              </>
            )}
          </YStack>

          {/* Step 1 — Email */}
          {step === "email" && (
            <YStack
              flex={1}
              justifyContent="space-between"
              marginTop={50}
              marginBottom={10}
            >
              <YStack padding={10}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="hello@mentoreo.in"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </YStack>

              <YStack
                alignItems="center"
                justifyContent="center"
                marginBottom={10}
                gap={12}
              >
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={sendOtp}
                  disabled={loading}
                >
                  <Text style={styles.signInBtnText}>
                    {loading ? "Sending..." : "Send OTP →"}
                  </Text>
                </TouchableOpacity>

                <XStack gap={5} alignItems="center">
                  <Text
                    textAlign="center"
                    fontSize={14}
                    color={"#7A7A7A"}
                    fontWeight={300}
                  >
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/onboarding/student-signin")}
                  >
                    <Text fontSize={16} color={"#263238"} fontWeight={700}>
                      Sign in
                    </Text>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </YStack>
          )}

          {/* Step 2 — OTP + Details */}
          {step === "details" && (
            <YStack
              flex={1}
              justifyContent="space-between"
              marginTop={30}
              marginBottom={10}
            >
              <YStack padding={10} gap={24}>
                {/* OTP */}
                <YStack gap={10}>
                  <Text style={styles.label}>ENTER OTP</Text>
                  <Text style={styles.subLabel}>Sent to {email}</Text>
                  <OtpInput value={otp} onChange={setOtp} />
                  <TouchableOpacity
                    onPress={sendOtp}
                    disabled={loading}
                    style={{ marginTop: 4 }}
                  >
                    <Text fontSize={14} fontWeight={300} color="#7A7A7A">
                      Didn't receive it?{" "}
                      <Text fontSize={14} fontWeight={700} color="#263238">
                        Resend
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </YStack>

                {/* Name */}
                <YStack>
                  <Text style={styles.label}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#bbb"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      setError("");
                    }}
                  />
                </YStack>

                {/* Phone (optional) */}
                <YStack>
                  <Text style={styles.label}>PHONE (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#bbb"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </YStack>

                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </YStack>

              <YStack
                alignItems="center"
                justifyContent="center"
                marginBottom={10}
              >
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={submit}
                  disabled={loading}
                >
                  <Text style={styles.signInBtnText}>
                    {loading ? "Creating account..." : "Create Account →"}
                  </Text>
                </TouchableOpacity>
              </YStack>
            </YStack>
          )}
        </YStack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#bbb",
    letterSpacing: 1,
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 13,
    color: "#7A7A7A",
    fontWeight: "300",
    marginTop: -6,
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  signInBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
    width: "100%",
  },
  signInBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorText: { color: "red", fontSize: 13, marginTop: 4 },
});
