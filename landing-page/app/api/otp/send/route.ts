import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase-server";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const purpose = body?.purpose as "signup" | "reset" | undefined;

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json({ error: "Email provider not configured." }, { status: 500 });
    }

    if (!process.env.OTP_SECRET) {
      return NextResponse.json({ error: "OTP secret not configured." }, { status: 500 });
    }

    const { data: latest } = await supabaseServer
      .from("email_otps")
      .select("created_at")
      .eq("email", email)
      .eq("purpose", purpose)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.created_at) {
      const lastSent = new Date(latest.created_at).getTime();
      if (Date.now() - lastSent < RESEND_COOLDOWN_SECONDS * 1000) {
        return NextResponse.json(
          { error: "Please wait a minute before requesting another code." },
          { status: 429 }
        );
      }
    }

    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    const codeHash = createHash("sha256")
      .update(code + process.env.OTP_SECRET)
      .digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseServer
      .from("email_otps")
      .insert({
        email,
        purpose,
        code_hash: codeHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      return NextResponse.json({ error: "Failed to store OTP." }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = purpose === "reset"
      ? "Your Mentoreo password reset code"
      : "Your Mentoreo verification code";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">${subject}</h2>
        <p style="margin: 0 0 16px;">Your one-time code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</div>
        <p style="margin-top: 16px; color: #6b7280;">This code expires in ${OTP_TTL_MINUTES} minutes.</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });

    if (emailError) {
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
