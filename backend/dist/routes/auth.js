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
/**
 * OTP store
 * key = email
 */
const otpStore = new Map();
/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function setOtp(email, role, purpose) {
    const otp = generateOtp();
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        purpose,
        role,
    });
    return otp;
}
function verifyStoredOtp(email, otp, role, purpose) {
    const stored = otpStore.get(email);
    if (!stored)
        return "No OTP found. Please request a new one.";
    if (stored.role !== role || stored.purpose !== purpose) {
        return "Invalid OTP request.";
    }
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return "OTP expired. Please request a new one.";
    }
    if (stored.otp !== otp)
        return "Invalid OTP";
    otpStore.delete(email);
    return null;
}
function getTable(role) {
    return role === "student" ? "student_signups" : "signups";
}
function createJwt(user, role) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role,
    }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
async function createSendbirdUser(user) {
    try {
        const response = await fetch(`https://api-${process.env.SENDBIRD_APP_ID}.sendbird.com/v3/users`, {
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
        if (!response.ok) {
            const err = await response.json();
            /**
             * 400201 = user already exists
             */
            if (err.code !== 400201) {
                console.error("Sendbird error:", err);
            }
        }
    }
    catch (error) {
        console.error("Sendbird failed:", error);
    }
}
async function sendOtpEmail(email, name, otp, role, purpose) {
    return resend_1.resend.emails.send({
        from: "Mentoreo <support@mentoreo.in>",
        to: email,
        subject: purpose === "login"
            ? "Your Mentoreo login code"
            : "Your Mentoreo signup code",
        html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto;">
        <h2>Your verification code</h2>
        <p>Hi ${name || "there"},</p>
        <p>
          Use this code to ${purpose} as a <strong>${role}</strong>.
          It expires in 10 minutes.
        </p>

        <div style="
          font-size:36px;
          font-weight:bold;
          letter-spacing:8px;
          margin:24px 0;
          color:#742DDD;
        ">
          ${otp}
        </div>

        <p style="color:#888;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
    });
}
/* -------------------------------------------------- */
/* LOGIN OTP SEND */
/* POST /auth/send-otp-login */
/* -------------------------------------------------- */
router.post("/send-otp-login", async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
    }
    if (!["student", "mentor"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }
    const table = getTable(role);
    const { data: user, error } = await supabase_1.supabase
        .from(table)
        .select("id, name, email")
        .eq("email", email)
        .single();
    if (error || !user) {
        return res.status(404).json({ error: "Account not found" });
    }
    const otp = setOtp(email, role, "login");
    const { error: emailError } = await sendOtpEmail(email, user.name, otp, role, "login");
    if (emailError) {
        return res.status(500).json({ error: "Failed to send OTP" });
    }
    res.json({ message: "OTP sent successfully" });
});
/* -------------------------------------------------- */
/* VERIFY LOGIN */
/* POST /auth/verify-login */
/* -------------------------------------------------- */
router.post("/verify-login", async (req, res) => {
    const { email, otp, role } = req.body;
    if (!email || !otp || !role) {
        return res
            .status(400)
            .json({ error: "Email, OTP and role are required" });
    }
    if (!["student", "mentor"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }
    const otpError = verifyStoredOtp(email, otp, role, "login");
    if (otpError) {
        return res.status(400).json({ error: otpError });
    }
    const table = getTable(role);
    const { data: user, error } = await supabase_1.supabase
        .from(table)
        .select("*")
        .eq("email", email)
        .single();
    if (error || !user) {
        return res.status(500).json({ error: "Failed to fetch user" });
    }
    await createSendbirdUser(user);
    const token = createJwt(user, role);
    res.json({
        token,
        user: { ...user, role },
    });
});
/* -------------------------------------------------- */
/* SIGNUP OTP SEND */
/* POST /auth/send-otp-signup */
/* -------------------------------------------------- */
router.post("/send-otp-signup", async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
    }
    if (!["student", "mentor"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }
    const table = getTable(role);
    const { data: existing } = await supabase_1.supabase
        .from(table)
        .select("id")
        .eq("email", email)
        .single();
    if (existing) {
        return res.status(400).json({ error: "Email already registered" });
    }
    const otp = setOtp(email, role, "signup");
    const { error } = await sendOtpEmail(email, "there", otp, role, "signup");
    if (error) {
        return res.status(500).json({ error: "Failed to send OTP" });
    }
    res.json({ message: "OTP sent successfully" });
});
/* -------------------------------------------------- */
/* STUDENT SIGNUP */
/* POST /auth/signup/student */
/* -------------------------------------------------- */
router.post("/signup/student", async (req, res) => {
    const { email, otp, name, phone } = req.body;
    if (!email || !otp || !name) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const otpError = verifyStoredOtp(email, otp, "student", "signup");
    if (otpError) {
        return res.status(400).json({ error: otpError });
    }
    const { data: user, error } = await supabase_1.supabase
        .from("student_signups")
        .insert({
        email,
        name,
        phone: phone || null,
    })
        .select()
        .single();
    if (error || !user) {
        return res.status(500).json({ error: "Signup failed" });
    }
    await createSendbirdUser(user);
    const token = createJwt(user, "student");
    res.json({
        token,
        user: { ...user, role: "student" },
    });
});
/* -------------------------------------------------- */
/* MENTOR SIGNUP */
/* POST /auth/signup/mentor */
/* -------------------------------------------------- */
router.post("/signup/mentor", async (req, res) => {
    const { email, otp, name, phone, college, course, branch } = req.body;
    if (!email || !otp || !name || !phone || !college) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const otpError = verifyStoredOtp(email, otp, "mentor", "signup");
    if (otpError) {
        return res.status(400).json({ error: otpError });
    }
    const { data: user, error } = await supabase_1.supabase
        .from("signups")
        .insert({
        email,
        name,
        phone,
        college,
        course: course || null,
        branch: branch || null,
    })
        .select()
        .single();
    if (error || !user) {
        return res.status(500).json({ error: "Signup failed" });
    }
    await createSendbirdUser(user);
    const token = createJwt(user, "mentor");
    res.json({
        token,
        user: { ...user, role: "mentor" },
    });
});
exports.default = router;
