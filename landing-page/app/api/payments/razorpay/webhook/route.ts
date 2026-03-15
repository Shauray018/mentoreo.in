import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const webhookSecret = process.env.RAZR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const bodyText = await req.text();
  const expected = createHmac("sha256", webhookSecret).update(bodyText).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(bodyText);
  const event = payload?.event;

  if (event !== "payment.captured") {
    return NextResponse.json({ ok: true });
  }

  const payment = payload?.payload?.payment?.entity;
  const order = payload?.payload?.order?.entity;
  const paymentId = payment?.id;
  const amount = Number(payment?.amount ?? 0);
  const email = order?.notes?.student_email || payment?.notes?.student_email;
  const creditPaise = Number(order?.notes?.credit_paise ?? amount);

  if (!paymentId || !email || !amount) {
    return NextResponse.json({ error: "Missing payment data" }, { status: 400 });
  }

  // Idempotency check
  const { data: existing } = await supabaseServer
    .from("student_wallet_transactions")
    .select("id")
    .eq("reference_id", paymentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true });
  }

  const { error: txErr } = await supabaseServer
    .from("student_wallet_transactions")
    .insert([{
      student_email: email,
      type: "credit",
      source: "recharge",
      amount_paise: creditPaise,
      reference_id: paymentId,
      metadata: {
        razorpay_order_id: order?.id,
      },
    }]);

  if (txErr) {
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }

  const { error: walletErr } = await supabaseServer.rpc("increment_student_wallet", {
    p_email: email,
    p_amount: creditPaise,
  });

  if (walletErr) {
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
