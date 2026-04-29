const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function normalizeAuthError(
  error: unknown,
  fallback: string,
  options?: { action?: "sendOtp" | "verifyOtp" | "signup" },
) {
  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = rawMessage.trim().toLowerCase();

  if (!message) return fallback;

  if (message.includes("network request failed") || message.includes("fetch")) {
    return "Unable to reach the server. Please try again.";
  }

  if (
    message.includes("invalid otp") ||
    message.includes("incorrect otp") ||
    message.includes("invalid code") ||
    message.includes("incorrect code") ||
    message.includes("wrong otp")
  ) {
    return "The OTP you entered is incorrect. Please try again.";
  }

  if (message.includes("expired") && message.includes("otp")) {
    return "This OTP has expired. Please request a new one.";
  }

  if (message.includes("email") && message.includes("not found")) {
    return "No account was found for this email.";
  }

  if (message.includes("already exists") || message.includes("already registered")) {
    return "An account with this email already exists.";
  }

  if (
    options?.action === "sendOtp" &&
    (message.includes("too many") || message.includes("rate limit"))
  ) {
    return "Too many OTP requests. Please wait and try again.";
  }

  return rawMessage || fallback;
}

export function isOtpError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : typeof error === "string" ? error.toLowerCase() : "";

  return (
    message.includes("otp") ||
    message.includes("code") ||
    message.includes("expired") ||
    message.includes("verification")
  );
}
