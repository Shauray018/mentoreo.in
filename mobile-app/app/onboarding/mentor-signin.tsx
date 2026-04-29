// MentorSignin.tsx
import { OtpInput } from "@/components/onboarding/otp-input";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { isValidEmail, normalizeAuthError } from "@/utils/auth-errors";
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

export default function MentorSignin() {
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authApi.sendLoginOtp(normalizedEmail, "mentor");
      setOtp("");
      setOtpStep(true);
    } catch (e: any) {
      setError(normalizeAuthError(e, "Failed to send OTP", { action: "sendOtp" }));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      setError("Please enter your email");
      setOtpStep(false);
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address");
      setOtpStep(false);
      return;
    }
    if (normalizedOtp.length < 6) {
      setError("Please enter the full 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await authApi.verifyLoginOtp(normalizedEmail, normalizedOtp, "mentor");
      signIn({ ...res.user, token: res.token });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(normalizeAuthError(e, "Verification failed", { action: "verifyOtp" }));
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
            onPress={() => (otpStep ? setOtpStep(false) : router.back())}
            marginTop={70}
            marginBottom={30}
          >
            <Text fontSize={22}>‹</Text>
          </Button>

          {/* Header */}
          <YStack>
            {otpStep ? (
              <>
                <Text fontSize={40} fontWeight={300}>
                  Check your
                </Text>
                <XStack>
                  <Text fontSize={40} fontWeight={600} color={"#FF8000"}>
                    Email
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
                  Enter the 6-digit code we sent to {email}
                </Text>
              </>
            ) : (
              <>
                <Text fontSize={40} fontWeight={300}>
                  Welcome
                </Text>
                <XStack>
                  <Text fontSize={40} fontWeight={600} color={"#FF8000"}>
                    Mentor
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
                  Sign in to connect with your students.
                </Text>
              </>
            )}
          </YStack>

          {/* Email step */}
          {!otpStep ? (
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
                  placeholder="mentor@mentoreo.in"
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

                <XStack gap={5} alignItems="center" marginBottom={10}>
                  <Text
                    textAlign="center"
                    fontSize={14}
                    color={"#7A7A7A"}
                    fontWeight={300}
                  >
                    New to mentoreo?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/onboarding/mentor-signup")}
                  >
                    <Text fontSize={16} color={"#263238"} fontWeight={700}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </YStack>
          ) : (
            /* OTP step */
            <YStack
              flex={1}
              justifyContent="space-between"
              marginTop={20}
              marginBottom={10}
            >
              <YStack padding={10} gap={20}>
                <Text style={styles.label}>ENTER OTP</Text>
                <OtpInput
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError("");
                  }}
                />
                <TouchableOpacity
                  onPress={sendOtp}
                  disabled={loading}
                  style={{ marginTop: 16 }}
                >
                  <Text fontSize={14} fontWeight={300} color="#7A7A7A">
                    Didn&apos;t receive it?{" "}
                    <Text fontSize={14} fontWeight={700} color="#263238">
                      Resend
                    </Text>
                  </Text>
                </TouchableOpacity>
                {!!error && <Text style={styles.errorText}>{error}</Text>}
              </YStack>

              <YStack
                alignItems="center"
                justifyContent="center"
                marginBottom={10}
              >
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={verify}
                  disabled={loading}
                >
                  <Text style={styles.signInBtnText}>
                    {loading ? "Verifying..." : "Verify OTP →"}
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
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 28,
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
