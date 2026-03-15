"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "motion/react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function StudentLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const sess = session as any;

      // Google authed but email not in student_signups table — sign out and send to student signup
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      role: "student",
      redirect: false,
      callbackUrl: "/student/dashboard",
    });
    setLoading(false);

    if (result?.ok) {
      toast.success("Signed in");
      router.push(result.url ?? "/student/dashboard");
    } else {
      setError("Invalid email or password.");
      toast.error("Invalid email or password.");
    }
  };

  const handleSendResetCode = async () => {
    if (!resetEmail.trim()) {
      toast.error("Enter your email first.");
      return;
    }
    setResetSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, purpose: "reset" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Failed to send code.");
        return;
      }
      toast.success("Reset code sent.");
    } catch (err) {
      toast.error("Failed to send code.");
    } finally {
      setResetSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim() || !resetCode.trim()) {
      toast.error("Email and code are required.");
      return;
    }
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/student-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword: resetPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Failed to reset password.");
        return;
      }
      toast.success("Password reset. You can sign in now.");
      setForgotOpen(false);
      setResetCode("");
      setResetPassword("");
      setResetConfirm("");
    } catch (err) {
      toast.error("Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };


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
          Welcome Back!
        </h2>
        <p
          className="mt-2 text-center text-sm text-[#4B5563] font-medium"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          Ready to achieve your college dreams?
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl py-6 px-4 sm:py-8 shadow-[0_8px_30px_rgba(151,88,255,0.08)] sm:rounded-[32px] rounded-[24px] sm:px-10 border-2 border-[#E1D4FF]"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-[16px] text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="block text-sm font-bold text-[#111827] mb-2">
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white"
                  placeholder="you@college.edu.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="block text-sm font-bold text-[#111827]">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm font-bold text-[#9758FF] hover:text-[#8A4FFF]"
                  onClick={() => setForgotOpen(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border-2 border-[#E1D4FF] rounded-[16px] placeholder-[#4B5563]/50 focus:outline-none focus:ring-0 focus:border-[#9758FF] sm:text-sm transition-colors bg-white/50 focus:bg-white pr-10"
                  placeholder="••••••••"
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-[16px] shadow-md text-base font-bold text-white bg-[#9758FF] hover:bg-[#8A4FFF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9758FF] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? "Logging in..." : "Sign In"}
                {!loading && (
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E1D4FF]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F8F5FF] rounded-full text-[#4B5563] font-medium border border-[#E1D4FF]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => signIn("google-student", { callbackUrl: "/student/login" })}
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
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E1D4FF]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F8F5FF] rounded-full text-[#4B5563] font-medium border border-[#E1D4FF]">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/student/signup"
                className="w-full flex justify-center items-center py-3.5 px-4 border-2 border-[#E1D4FF] rounded-[16px] shadow-sm text-base font-bold text-[#9758FF] bg-white hover:bg-[#F6F2FF] hover:border-[#9758FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9758FF] transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join as Student
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Enter your email to receive a 6-digit reset code.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@college.edu.in"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1.5 rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <Input
                id="reset-code"
                type="text"
                placeholder="6-digit code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="rounded-xl h-11"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={handleSendResetCode}
                disabled={resetSending}
              >
                {resetSending ? "Sending…" : "Send code"}
              </Button>
            </div>
            <div>
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="mt-1.5 rounded-xl h-11"
              />
            </div>
            <div>
              <Label htmlFor="reset-confirm">Confirm password</Label>
              <Input
                id="reset-confirm"
                type="password"
                placeholder="••••••••"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                className="mt-1.5 rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="bg-[#9758FF] hover:bg-[#8A4FFF] text-white"
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Updating…" : "Reset password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
