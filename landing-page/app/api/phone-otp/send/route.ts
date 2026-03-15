import { NextResponse } from "next/server";

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91")) return digits;
  return digits;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawPhone = (body?.phone as string | undefined)?.trim();

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone is required." }, { status: 400 });
    }

    if (!process.env.MSG91_AUTHKEY || !process.env.MSG91_OTP_TEMPLATE_ID) {
      return NextResponse.json({ error: "MSG91 not configured." }, { status: 500 });
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });

    const sendUrl = new URL("https://control.msg91.com/api/v5/otp");
    sendUrl.searchParams.set("template_id", process.env.MSG91_OTP_TEMPLATE_ID);
    sendUrl.searchParams.set("mobile", phone);
    sendUrl.searchParams.set("authkey", process.env.MSG91_AUTHKEY);

    const res = await fetch(sendUrl.toString(), { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || "Failed to send OTP." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
