import crypto from "crypto";
import express, { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import { supabase } from "../lib/supabase";

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZR_LIVEKEY!,
  key_secret: process.env.RAZR_LIVESECRET!,
});

type WalletTopupRpcResult = {
  already_processed: boolean;
  balance_paise: number;
  transaction_id: string;
  transaction_balance_after_paise: number;
};

type RazorpayWebhookPaymentEntity = {
  id: string;
  order_id?: string;
  amount: number;
  status?: string;
  method?: string;
  notes?: Record<string, string>;
};

function verifySignature(payload: Buffer, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

async function creditWalletTopup(params: {
  studentEmail: string;
  amountPaise: number;
  referenceId: string;
  description: string;
  metadata: Record<string, unknown>;
}) {
  const rpcRes = await supabase.rpc("credit_student_wallet_topup", {
    p_student_email: params.studentEmail,
    p_amount_paise: params.amountPaise,
    p_reference_id: params.referenceId,
    p_description: params.description,
    p_source: "razorpay",
    p_metadata: params.metadata,
  });

  if (rpcRes.error || !rpcRes.data) {
    throw new Error(`wallet credit rpc failed: ${rpcRes.error?.message ?? "unknown error"}`);
  }

  const rpcRow = (Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data) as WalletTopupRpcResult;
  if (!rpcRow?.transaction_id) {
    throw new Error("wallet credit rpc returned no transaction id");
  }

  return rpcRow;
}

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signature = req.header("x-razorpay-signature");
    if (!signature) {
      res.status(400).json({ error: "Missing Razorpay signature" });
      return;
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");

    if (!verifySignature(rawBody, signature, process.env.RAZR_WEBHOOK_SECRET!)) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.status(400).json({ error: "Invalid webhook payload" });
      return;
    }

    if (event.event !== "payment.captured") {
      res.json({ ok: true });
      return;
    }

    const payment = event.payload?.payment?.entity as RazorpayWebhookPaymentEntity | undefined;
    if (!payment?.id || !payment.amount) {
      res.json({ ok: true });
      return;
    }

    try {
      const order = payment.order_id ? await razorpay.orders.fetch(payment.order_id) : null;
      const notes = {
        ...(order?.notes ?? {}),
        ...(payment.notes ?? {}),
      };

      if (notes.purpose !== "wallet_topup" || !notes.student_email) {
        res.json({ ok: true });
        return;
      }

      await creditWalletTopup({
        studentEmail: notes.student_email,
        amountPaise: Number(payment.amount),
        referenceId: payment.id,
        description: "Wallet top-up via Razorpay webhook",
        metadata: {
          webhook_event: event.event,
          webhook_created_at: event.created_at ?? null,
          payment_id: payment.id,
          payment_status: payment.status ?? null,
          payment_method: payment.method ?? null,
          order_id: payment.order_id ?? order?.id ?? null,
        },
      });

      res.json({ ok: true });
    } catch (error) {
      console.error("razorpay webhook processing failed", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  },
);

export default router;
