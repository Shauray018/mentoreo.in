import crypto from "crypto";
import { Request, Response, Router } from "express";
import Razorpay from "razorpay";
import { supabase } from "../lib/supabase";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const MINIMUM_TOPUP_PAISE = 1_000;

const razorpay = new Razorpay({
  key_id: process.env.RAZR_LIVEKEY!,
  key_secret: process.env.RAZR_LIVESECRET!,
});

type AuthenticatedRequest = Request & {
  user: {
    email: string;
    role?: string;
  };
};

type WalletTopupRpcResult = {
  already_processed: boolean;
  balance_paise: number;
  transaction_id: string;
  transaction_balance_after_paise: number;
};

function requireStudent(req: AuthenticatedRequest, res: Response): string | null {
  if (req.user.role !== "student") {
    res.status(403).json({ error: "Students only" });
    return null;
  }

  return req.user.email;
}

function parseTopupAmountPaise(amountRupees: unknown): number | null {
  const parsed = Number(amountRupees);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const amountPaise = Math.round(parsed * 100);
  if (amountPaise < MINIMUM_TOPUP_PAISE) {
    return null;
  }

  return amountPaise;
}

function verifyRazorpaySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

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

  const txRes = await supabase
    .from("student_wallet_transactions")
    .select("*")
    .eq("id", rpcRow.transaction_id)
    .single();

  if (txRes.error || !txRes.data) {
    throw new Error(`failed to fetch credited transaction: ${txRes.error?.message ?? "not found"}`);
  }

  return {
    alreadyProcessed: rpcRow.already_processed,
    balancePaise: rpcRow.balance_paise,
    transaction: txRes.data,
  };
}

router.get("/balance", authMiddleware, async (req: Request, res: Response) => {
  const { email } = (req as AuthenticatedRequest).user;

  const { data, error } = await supabase
    .from("student_wallets")
    .select("balance_paise")
    .eq("student_email", email)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  res.json({
    balance_paise: data.balance_paise,
    balanceRupees: (data.balance_paise / 100).toFixed(2),
  });
});

router.get("/transactions", authMiddleware, async (req: Request, res: Response) => {
  const { email } = (req as AuthenticatedRequest).user;
  const page = Math.max(parseInt((req.query.page as string) ?? "1", 10) || 1, 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("student_wallet_transactions")
    .select("*", { count: "exact" })
    .eq("student_email", email)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
    return;
  }

  res.json({ transactions: data, total: count, page });
});

router.post("/topup/order", authMiddleware, async (req: Request, res: Response) => {
  const email = requireStudent(req as AuthenticatedRequest, res);
  if (!email) {
    return;
  }

  const amountPaise = parseTopupAmountPaise(req.body?.amountRupees);
  if (amountPaise === null) {
    res.status(400).json({ error: "Minimum top-up is Rs 10" });
    return;
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
      notes: {
        student_email: email,
        purpose: "wallet_topup",
      },
    });

    res.json({
      orderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: process.env.RAZR_LIVEKEY,
    });
  } catch (error) {
    console.error("create topup order failed", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

router.post("/topup/verify", authMiddleware, async (req: Request, res: Response) => {
  const email = requireStudent(req as AuthenticatedRequest, res);
  if (!email) {
    return;
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing Razorpay payment fields" });
    return;
  }

  if (
    !verifyRazorpaySignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZR_LIVESECRET!,
    )
  ) {
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  try {
    const [payment, order] = await Promise.all([
      razorpay.payments.fetch(razorpay_payment_id),
      razorpay.orders.fetch(razorpay_order_id),
    ]);

    if (payment.order_id !== razorpay_order_id) {
      res.status(400).json({ error: "Payment does not match order" });
      return;
    }

    if (order.notes?.student_email !== email || order.notes?.purpose !== "wallet_topup") {
      res.status(403).json({ error: "Order does not belong to this student" });
      return;
    }

    if (payment.status !== "captured") {
      res.status(409).json({ error: "Payment is not captured" });
      return;
    }

    const amountPaise = Number(payment.amount);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      res.status(400).json({ error: "Invalid payment amount" });
      return;
    }

    const credited = await creditWalletTopup({
      studentEmail: email,
      amountPaise,
      referenceId: razorpay_payment_id,
      description: "Wallet top-up via Razorpay",
      metadata: {
        payment_id: payment.id,
        order_id: order.id,
        payment_status: payment.status,
        order_receipt: order.receipt ?? null,
        payment_method: payment.method ?? null,
      },
    });

    res.json({
      success: true,
      alreadyProcessed: credited.alreadyProcessed,
      balance_paise: credited.balancePaise,
      transaction: credited.transaction,
    });
  } catch (error) {
    console.error("verify topup failed", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default router;
