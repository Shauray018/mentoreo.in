// StudentSignin.tsx
import { OtpInput } from "@/components/onboarding/otp-input";
import Slide1 from "@/components/onboarding/slides/Slide1";
import Slide2 from "@/components/onboarding/slides/Slide2";
import Slide3 from "@/components/onboarding/slides/Slide3";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";

const { width } = Dimensions.get("window");
const ORANGE = "#FF7A00";

// Each slide is its own component — no shared data array
const SLIDES = [
  { id: "1", Component: Slide1 },
  { id: "2", Component: Slide2 },
  { id: "3", Component: Slide3 },
];

export default function StudentSignin() {
  const signIn = useAuthStore((s) => s.signIn);

  const [phase, setPhase] = useState<"onboarding" | "signin">("onboarding");
  const [slideIndex, setSlideIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flatListRef = useRef<FlatList>(null);

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setSlideIndex(index);
  };

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) {
      goToSlide(slideIndex + 1);
    } else {
      setPhase("signin");
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      await authApi.sendLoginOtp(email, "student");
      setOtpStep(true);
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authApi.verifyLoginOtp(email, otp, "student");
      signIn({ ...res.user, token: res.token });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (phase === "onboarding") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => setPhase("signin")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: { Component } }) => (
            <View style={{ width }}>
              <Component />
            </View>
          )}
        />

        {/* Shared pagination footer — lives outside the slides */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, slideIndex === i && styles.dotActive]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <YStack flex={1} backgroundColor={"#ECECEC"} paddingHorizontal={20}>
          <Button
            alignSelf="flex-start"
            backgroundColor={"white"}
            borderRadius={100}
            onPress={() => setPhase("onboarding")}
            marginTop={70}
            marginBottom={30}
          >
            <Text fontSize={22}>‹</Text>
          </Button>

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
                    Student
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
                  Sign in to continue your journey.
                </Text>
              </>
            )}
          </YStack>
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
                  placeholder="hello@mentoreo.in"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </YStack>

              <YStack
                alignItems="center"
                justifyContent="center"
                marginBottom={10}
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

                <XStack gap={5} alignItems="center" marginBottom={22}>
                  <Text
                    textAlign="center"
                    fontSize={14}
                    color={"#7A7A7A"}
                    fontWeight={300}
                  >
                    New to mentoreo?
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/onboarding/student-signup")}
                  >
                    <Text fontSize={16} color={"#263238"} fontWeight={700}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </YStack>
          ) : (
            <YStack
              flex={1}
              justifyContent="space-between"
              marginTop={20}
              marginBottom={10}
            >
              <YStack padding={10} gap={20}>
                <Text style={styles.label}>ENTER OTP</Text>

                <OtpInput value={otp} onChange={setOtp} />
                <TouchableOpacity
                  onPress={sendOtp}
                  disabled={loading}
                  style={{ marginTop: 16 }}
                >
                  <Text fontSize={14} fontWeight={300} color="#7A7A7A">
                    Didn't receive it?{" "}
                    <Text fontSize={14} fontWeight={700} color="#263238">
                      Resend
                    </Text>
                  </Text>
                </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#fff" },

  skipBtn: { position: "absolute", top: 52, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, fontWeight: "600", color: "#999" },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 24,
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e0e0e0" },
  dotActive: { width: 22, backgroundColor: ORANGE },
  nextBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FF8000",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nextArrow: { color: "#fff", fontSize: 22, fontWeight: "700" },

  backBtn: { padding: 16, paddingTop: 52, borderWidth: 1 },
  backText: { fontSize: 30, color: "#555" },

  signinBody: { flex: 1, paddingHorizontal: 28 },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    lineHeight: 38,
    marginBottom: 6,
  },
  welcomeAccent: { color: ORANGE },
  signinSubtitle: { fontSize: 13, color: "#aaa", marginBottom: 36 },

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
  errorText: { color: "red", fontSize: 13, marginBottom: 12 },
  signupText: {
    textAlign: "center",
    fontSize: 13,
    color: "#aaa",
    marginTop: 8,
  },
  signupLink: { color: ORANGE, fontWeight: "600" },
});
