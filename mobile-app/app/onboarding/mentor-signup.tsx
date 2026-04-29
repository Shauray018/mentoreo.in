// MentorSignup.tsx
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useState } from "react";

// Step components
import { StepBranch } from "@/components/onboarding/steps/StepBranch";
import { StepCollege } from "@/components/onboarding/steps/StepCollege";
import { StepCourse } from "@/components/onboarding/steps/StepCourse";
import { StepEmail } from "@/components/onboarding/steps/StepMail";
import { StepName } from "@/components/onboarding/steps/StepName";
import { StepOtp } from "@/components/onboarding/steps/StepOtp";
import { StepPhone } from "@/components/onboarding/steps/StepPhone";

type Step =
  | "email"
  | "otp"
  | "name"
  | "phone"
  | "college"
  | "course"
  | "branch";

const STEP_ORDER: Step[] = [
  "email",
  "otp",
  "name",
  "phone",
  "college",
  "course",
  "branch",
];

export default function MentorSignup() {
  const signIn = useAuthStore((s) => s.signIn);

  // Navigation
  const [step, setStep] = useState<Step>("email");

  // Fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [branch, setBranch] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx === 0) {
      router.back();
    } else {
      setStep(STEP_ORDER[idx - 1]);
      setError("");
    }
  };

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1]);
      setError("");
    }
  };

  const resolvedCourse = course === "Other" ? customCourse.trim() : course;

  // ─── API calls ──────────────────────────────────────────────────────────────

  const sendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await authApi.sendSignupOtp(email.trim(), "mentor");
      goNext();
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    // Optimistically advance — backend verification happens at submit
    goNext();
  };

  const submitSignup = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authApi.signupMentor({
        email: email.trim(),
        otp,
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone: phone.trim(),
        college: college.trim(),
        course: resolvedCourse || undefined,
        branch: branch || undefined,
      });
      signIn({ ...res.user, token: res.token });
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  switch (step) {
    case "email":
      return (
        <StepEmail
          email={email}
          setEmail={(v) => {
            setEmail(v);
            setError("");
          }}
          error={error}
          loading={loading}
          onContinue={sendOtp}
        />
      );

    case "otp":
      return (
        <StepOtp
          email={email}
          otp={otp}
          setOtp={setOtp}
          onResend={sendOtp}
          onBack={goBack}
          onContinue={verifyOtp}
          loading={loading}
          error={error}
        />
      );

    case "name":
      return (
        <StepName
          firstName={firstName}
          lastName={lastName}
          setFirstName={(v) => {
            setFirstName(v);
            setError("");
          }}
          setLastName={setLastName}
          error={error}
          onBack={goBack}
          onContinue={goNext}
        />
      );

    case "phone":
      return (
        <StepPhone
          phone={phone}
          setPhone={(v) => {
            setPhone(v);
            setError("");
          }}
          error={error}
          onBack={goBack}
          onContinue={goNext}
        />
      );

    case "college":
      return (
        <StepCollege
          college={college}
          setCollege={(v) => {
            setCollege(v);
            setError("");
          }}
          error={error}
          onBack={goBack}
          onContinue={goNext}
        />
      );

    case "course":
      return (
        <StepCourse
          course={course}
          setCourse={setCourse}
          customCourse={customCourse}
          setCustomCourse={setCustomCourse}
          onBack={goBack}
          onContinue={goNext}
        />
      );

    case "branch":
      return (
        <StepBranch
          branch={branch}
          setBranch={setBranch}
          onBack={goBack}
          onContinue={submitSignup}
          loading={loading}
        />
      );
  }
}
