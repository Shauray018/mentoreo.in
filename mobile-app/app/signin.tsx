import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSendbirdChat } from "@sendbird/uikit-react-native";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Role = "student" | "mentor";
type Step = "role" | "email" | "otp";

export default function SigninScreen() {
  const { signIn } = useAuthStore();
  const { sdk } = useSendbirdChat();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.sendOtp(email.trim().toLowerCase(), role);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Enter the full OTP");
      shake();
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(
        email.trim().toLowerCase(),
        otp,
        role,
      );
      const { token, user } = res;
      const authUser = {
        ...user,
        id: String(user.id),
        role: user.role as Role,
        token,
      };

      // Connect to Sendbird
      await sdk.connect(authUser.id);

      await sdk.updateCurrentUserInfo({
        nickname: "Shauray",
        profileUrl: "https://yourdomain.com/avatar.png",
      });
      console.log(authUser.id);

      // Persist auth to Zustand (which persists to AsyncStorage)
      signIn(authUser);

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
      shake();
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.inner}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.appName}>Mentoreo</Text>
          <Text style={styles.tagline}>
            Learn from those who&apos;ve been there
          </Text>
        </View>

        {/* Role step */}
        {step === "role" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>I am a…</Text>
            <View style={styles.roleRow}>
              {(["student", "mentor"] as Role[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                >
                  <Text style={styles.roleEmoji}>
                    {r === "student" ? "🎓" : "🧠"}
                  </Text>
                  <Text
                    style={[
                      styles.roleLabel,
                      role === r && styles.roleLabelActive,
                    ]}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setStep("email")}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Email step */}
        {step === "email" && (
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.cardTitle}>
              {role === "student" ? "Student" : "Mentor"} sign in
            </Text>
            <Text style={styles.cardSub}>
              We&apos;ll send a one-time code to your email
            </Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
              returnKeyType="send"
              onSubmitEditing={handleSendOtp}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.primaryBtnText}>Send OTP</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep("role")}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>← Change role</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* OTP step */}
        {step === "otp" && (
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.cardTitle}>Check your inbox</Text>
            <Text style={styles.cardSub}>
              Sent a code to{" "}
              <Text style={{ color: Colors.accent }}>{email}</Text>
            </Text>
            <TextInput
              ref={otpRef}
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              placeholderTextColor={Colors.textMuted}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerifyOtp}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.primaryBtnText}>Verify & Sign In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  orb1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.accent,
    opacity: 0.07,
  },
  orb2: {
    position: "absolute",
    bottom: 40,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#5B6EF5",
    opacity: 0.06,
  },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: Spacing.lg },
  brand: { alignItems: "center", marginBottom: Spacing.xxl },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    shadowColor: Colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  logoLetter: { fontSize: 32, fontWeight: "800", color: Colors.bg },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  roleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  roleBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  roleEmoji: { fontSize: 28, marginBottom: 6 },
  roleLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  roleLabelActive: { color: Colors.accent },
  input: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  otpInput: {
    fontSize: FontSize.xxl,
    letterSpacing: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.bg,
  },
  backBtn: { marginTop: Spacing.md, alignItems: "center" },
  backBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
