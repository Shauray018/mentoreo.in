"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
const resend_1 = require("../lib/resend");
const router = (0, express_1.Router)();
const otpStore = new Map();
// POST /auth/send-otp
router.post("/send-otp", async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
        res.status(400).json({ error: "Email and role are required" });
        return;
    }
    if (!["student", "mentor"].includes(role)) {
        res.status(400).json({ error: "Role must be student or mentor" });
        return;
    }
    // Check user exists in the correct table
    const table = role === "student" ? "student_signups" : "signups";
    const { data: user, error } = await supabase_1.supabase
        .from(table)
        .select("id, name, email")
        .eq("email", email)
        .single();
    if (error || !user) {
        res.status(404).json({ error: `No ${role} account found with this email` });
        return;
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt });
    // Send OTP via Resend
    const { error: emailError } = await resend_1.resend.emails.send({
        from: "Mentoreo <onboarding@resend.dev>",
        to: email,
        subject: "Your Mentoreo login code",
        html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Your login code</h2>
        <p>Hi ${user.name},</p>
        <p>Use the code below to sign in as a <strong>${role}</strong>. It expires in 10 minutes.</p>
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
router.post("/verify-otp", async (req, res) => {
    const { email, otp, role } = req.body;
    if (!email || !otp || !role) {
        res.status(400).json({ error: "Email, OTP and role are required" });
        return;
    }
    if (!["student", "mentor"].includes(role)) {
        res.status(400).json({ error: "Role must be student or mentor" });
        return;
    }
    // Validate OTP
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
    // Fetch user from correct table
    const table = role === "student" ? "student_signups" : "signups";
    const { data: user, error } = await supabase_1.supabase
        .from(table)
        .select("id, name, email, phone")
        .eq("email", email)
        .single();
    if (error || !user) {
        res.status(500).json({ error: "Failed to fetch user" });
        return;
    }
    // Upsert user in Sendbird
    try {
        const sendbirdRes = await fetch(`https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Token": process.env.SENDBIRD_API_TOKEN,
            },
            body: JSON.stringify({
                user_id: user.id,
                nickname: user.name,
                profile_url: "",
                issue_access_token: false,
            }),
        });
        if (!sendbirdRes.ok) {
            const sbError = await sendbirdRes.json();
            if (sbError.code !== 400201) {
                console.error("Sendbird upsert error:", sbError);
            }
        }
    }
    catch (sbErr) {
        console.error("Sendbird API call failed:", sbErr);
    }
    // Issue JWT with role included
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { ...user, role } });
});
exports.default = router;
