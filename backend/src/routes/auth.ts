import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import { resend } from "../lib/resend";

const router = Router();

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// POST /auth/send-otp
router.post("/send-otp", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Check if user exists in signups table
  const { data: user, error } = await supabase
    .from("signups")
    .select("id, name, email")
    .eq("email", email)
    .single();

  if (error || !user) {
    res.status(404).json({ error: "No account found with this email" });
    return;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email, { otp, expiresAt });

  // Send OTP via Resend
  const { error: emailError } = await resend.emails.send({
    from: "Mentoreo <support@mentoreo.in>", // change to your verified domain
    to: email,
    subject: "Your Mentoreo login code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Your login code</h2>
        <p>Hi ${user.name},</p>
        <p>Use the code below to sign in. It expires in 10 minutes.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 24px 0; color: #742DDD;">
          ${otp}
        </div>
        <p style="color: #888;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    res.status(500).json({ error: "Failed to send OTP email" });
    return;
  }

  res.json({ message: "OTP sent successfully" });
});

// POST /auth/verify-otp
router.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  const stored = otpStore.get(email);

  if (!stored) {
    res.status(400).json({ error: "No OTP found. Please request a new one." });
    return;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    res.status(400).json({ error: "OTP expired. Please request a new one." });
    return;
  }

  if (stored.otp !== otp) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  otpStore.delete(email);

  // Fetch user from Supabase
  const { data: user, error } = await supabase
    .from("signups")
    .select("id, name, email, phone, college, branch")
    .eq("email", email)
    .single();

  if (error || !user) {
    res.status(500).json({ error: "Failed to fetch user" });
    return;
  }

  // Upsert user in Sendbird (creates if not exists, updates if they do)
  try {
    const sendbirdRes = await fetch(
      `https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": process.env.SENDBIRD_API_TOKEN!,
        },
        body: JSON.stringify({
          user_id: user.id,           // your Supabase UUID as Sendbird user_id
          nickname: user.name,
          profile_url: "",
          issue_access_token: false,
        }),
      }
    );

    // 400 with "User ID already exists" is fine — user already registered
    if (!sendbirdRes.ok) {
      const sbError = await sendbirdRes.json();
      // code 400201 = user already exists, that's okay
      if (sbError.code !== 400201) {
        console.error("Sendbird upsert error:", sbError);
        // non-fatal — still let the user log in
      }
    }
  } catch (sbErr) {
    console.error("Sendbird API call failed:", sbErr);
    // non-fatal
  }

  // Issue JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );

  res.json({ token, user });
});

export default router;