"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "motion/react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StudentSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const sess = session as any;

      if (sess?.unregistered) {
        const unregisteredEmail = sess.unregisteredEmail ?? "";
        signOut({ redirect: false }).then(() => {
          router.replace(`/student/signup?email=${encodeURIComponent(unregisteredEmail)}`);
        });
        return;
      }

      const role = (session?.user as any)?.role;
      if (role === "mentor") {
        router.replace("/mentor/dashboard");
        return;
      }

      router.replace("/student/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    if (prefillEmail) {
      setEmail(decodeURIComponent(prefillEmail));
      setEmailOtpVerified(false);
      setOtp("");
    }
  }, [searchParams]);

  const canSendOtp = EMAIL_RE.test(email.trim());

  const handleSendOtp = async () => {
    if (!canSendOtp) {
      setError("Enter a valid email first.");
      return;
    }
    setError("");
    setOtpSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "signup" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to send code.");
        return;
      }
      setError("Verification code sent. Check your inbox.");
    } catch (err) {
      setError("Failed to send code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setOtpVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, purpose: "signup" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Invalid code.");
        return;
      }
      setEmailOtpVerified(true);
      setError("Email verified.");
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!emailOtpVerified) {
      setError("Please verify your email before signing up.");
      return;
    }
    setLoading(true);

    const { data: hashedPassword, error: hashError } = await supabase.rpc("hash_password", {
      password,
    });

    if (hashError || !hashedPassword) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("student_signups").insert([
      {
        name,
        phone,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    ]);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("This email is already registered. Try signing in instead.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F2FF] via-[#EFEAFF] to-[#E3DCFF] flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-6 w-20 h-20 rounded-full bg-[#E3DCFF] flex items-center justify-center">
          🎉
        </div>
        <h1 className="text-4xl md:text-5xl text-[#111827] tracking-tight mb-3">
          You're in!
        </h1>
        <p className="text-[#4B5563] mb-2">
          We&apos;ll reach out to{" "}
          <strong className="text-[#111827] font-semibold">{email}</strong> soon.
        </p>
        <p className="text-[#6B7280] text-sm mb-10">
          Welcome to Mentoreo, {name.split(" ")[0]}.
        </p>
        <Link
          href="/student/login"
          className="bg-[#9758FF] hover:bg-[#8A4FFF] text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 hover:scale-105"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F2FF] via-[#EFEAFF] to-[#E3DCFF] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/40 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#CBB5FF]/40 blur-[120px]"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4 sm:mb-6">
          <Link href="/" className="group">
            <span
              className="text-3xl sm:text-4xl font-bold text-[#9758FF] leading-none"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              Mentoreo
            </span>
          </Link>
        </div>
        <h2
          className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#111827]"
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          Join as a Student
        </h2>
        <p
          className="mt-2 text-center text-sm text-[#4B5563] font-medium"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          Create your account in minutes.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl py-6 px-4 sm:py-8 shadow-[0_8px_30px_rgba(151,88,255,0.08)] sm:rounded-[32px] rounded-[24px] sm:px-10 border-2 border-[#E1D4FF]"
        >
          <div className="grid gap-3 mb-6">
            <button
              type="button"
              onClick={() => signIn("google-student", { callbackUrl: "/student/signup" })}
              className="w-full flex items-center justify-center gap-2 rounded-[16px] h-12 border-2 border-[#E1D4FF] hover:border-[#9758FF] hover:bg-[#F6F2FF] text-sm font-semibold"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E1D4FF]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F8F5FF] rounded-full text-[#4B5563] font-medium border border-[#E1D4FF]">
                Or sign up with email
              </span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-[16px] text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="name" className="block text-sm font-bold text-[#111827] mb-2">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-bold text-[#111827] mb-2">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailOtpVerified(false);
                }}
                className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white"
                placeholder="you@college.edu.in"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="otp" className="block text-sm font-bold text-[#111827]">
                Email verification code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white"
                  placeholder="6-digit code"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-[14px] border-2 border-[#E1D4FF]"
                  onClick={handleSendOtp}
                  disabled={otpSending || !canSendOtp}
                >
                  {otpSending ? "Sending…" : "Send code"}
                </Button>
              </div>
              <Button
                type="button"
                className="bg-[#9758FF] hover:bg-[#8A4FFF] text-white rounded-[14px] h-11"
                onClick={handleVerifyOtp}
                disabled={otpVerifying || !otp.trim()}
              >
                {otpVerifying ? "Verifying…" : emailOtpVerified ? "Verified" : "Verify code"}
              </Button>
            </div>

            <div>
              <Label htmlFor="phone" className="block text-sm font-bold text-[#111827] mb-2">
                Phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white"
                placeholder="9876543210"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-bold text-[#111827] mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4B5563] hover:text-[#9758FF] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm" className="block text-sm font-bold text-[#111827] mb-2">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#4B5563] hover:text-[#9758FF] transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-[16px] shadow-md text-base font-bold text-white bg-[#9758FF] hover:bg-[#8A4FFF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9758FF] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4B5563]">
            Already have an account?{" "}
            <Link href="/student/login" className="text-[#9758FF] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
      </div>
  );
}
