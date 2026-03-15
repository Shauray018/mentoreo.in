import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount_paise = Number(body?.amount_paise);
    const credit_paise = Number(body?.credit_paise ?? amount_paise);
    const email = (body?.email as string | undefined)?.trim();

    if (!amount_paise || amount_paise < 100) {
      return NextResponse.json({ error: "amount_paise required" }, { status: 400 });
    }
    if (!process.env.RAZR_LIVEKEY || !process.env.RAZR_LIVESECRET) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const auth = Buffer.from(`${process.env.RAZR_LIVEKEY}:${process.env.RAZR_LIVESECRET}`).toString("base64");
    const receipt = `rcpt_${Date.now()}`;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount_paise,
        currency: "INR",
        receipt,
        notes: {
          student_email: email ?? "",
          credit_paise: String(credit_paise),
        },
      }),
    });

    const data = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      return NextResponse.json({ error: data?.error?.description || "Order create failed" }, { status: 500 });
    }

    return NextResponse.json({
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: process.env.RAZR_LIVEKEY,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
