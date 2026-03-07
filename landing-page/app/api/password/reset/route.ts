import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const code = (body?.code as string | undefined)?.trim();
    const newPassword = body?.newPassword as string | undefined;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (!process.env.OTP_SECRET) {
      return NextResponse.json({ error: "OTP secret not configured." }, { status: 500 });
    }

    const { data: otp } = await supabaseServer
      .from("email_otps")
      .select("id, code_hash, expires_at")
      .eq("email", email)
      .eq("purpose", "reset")
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otp) {
      return NextResponse.json({ error: "No valid code found." }, { status: 400 });
    }

    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Code has expired." }, { status: 400 });
    }

    const codeHash = createHash("sha256")
      .update(code + process.env.OTP_SECRET)
      .digest("hex");

    if (codeHash !== otp.code_hash) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const { data: hashedPassword, error: hashError } = await supabaseServer.rpc(
      "hash_password",
      { password: newPassword }
    );

    if (hashError || !hashedPassword) {
      return NextResponse.json({ error: "Failed to hash password." }, { status: 500 });
    }

    const { error: updateError } = await supabaseServer
      .from("signups")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }

    await supabaseServer
      .from("email_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otp.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
