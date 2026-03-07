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

export default function MentorLogin() {
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

      // Google authed but email not in signups table — sign out and send to onboard
      if (sess?.unregistered) {
        const unregisteredEmail = sess.unregisteredEmail ?? "";
        signOut({ redirect: false }).then(() => {
          router.replace(`/onboard?email=${encodeURIComponent(unregisteredEmail)}`);
        });
        return;
      }

      router.replace("/mentor/dashboard");
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
      redirect: false,
      callbackUrl: "/mentor/dashboard",
    });
    setLoading(false);

    if (result?.ok) {
      toast.success("Signed in");
      router.push(result.url ?? "/mentor/dashboard");
    } else {
      setError("Invalid email or password. Try a demo account below.");
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
      const res = await fetch("/api/password/reset", {
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
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col">
      {/* Header */}
      <header className="px-6 sm:px-10 py-5">
        <Link href="/" className="inline-flex items-end gap-0.5">
          <img src="/icon.jpg" alt="Mentoreo Logo" className="h-10 w-10 rounded-lg" />
          <span
            className="text-3xl text-gray-900 leading-none"
            style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 700 }}
          >
            <span className="text-[#FF7A1F]">entoreo</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-[#FF7A1F]" />
              </div>
              <h1 className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Welcome back,{" "}
                <span className="text-[#FF7A1F]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  Mentor
                </span>
              </h1>
              <p className="text-gray-500 text-sm">
                Sign in to access your dashboard and sessions.
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-6"
              >
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-xl h-12"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-[#FF7A1F] hover:underline"
                    onClick={() => setForgotOpen(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-12 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white rounded-xl h-12 text-base transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:scale-[1.02]"
                }`}
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* OAuth */}
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/mentor/login" })}
                className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm"
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

            {/* Sign up link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Not a mentor yet?{" "}
                <Link
                  href="/onboard"
                  className="text-[#FF7A1F] hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  Apply here →
                </Link>
              </p>
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
              className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white"
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
