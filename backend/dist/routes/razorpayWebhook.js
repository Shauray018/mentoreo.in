"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importStar(require("express"));
const razorpay_1 = __importDefault(require("razorpay"));
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZR_LIVEKEY,
    key_secret: process.env.RAZR_LIVESECRET,
});
function verifySignature(payload, signature, secret) {
    const expectedSignature = crypto_1.default.createHmac("sha256", secret).update(payload).digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(expectedBuffer, actualBuffer);
}
async function creditWalletTopup(params) {
    const rpcRes = await supabase_1.supabase.rpc("credit_student_wallet_topup", {
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
    const rpcRow = (Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data);
    if (!rpcRow?.transaction_id) {
        throw new Error("wallet credit rpc returned no transaction id");
    }
    return rpcRow;
}
router.post("/razorpay", express_1.default.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.header("x-razorpay-signature");
    if (!signature) {
        res.status(400).json({ error: "Missing Razorpay signature" });
        return;
    }
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");
    if (!verifySignature(rawBody, signature, process.env.RAZR_WEBHOOK_SECRET)) {
        res.status(401).json({ error: "Invalid webhook signature" });
        return;
    }
    let event;
    try {
        event = JSON.parse(rawBody.toString("utf8"));
    }
    catch {
        res.status(400).json({ error: "Invalid webhook payload" });
        return;
    }
    if (event.event !== "payment.captured") {
        res.json({ ok: true });
        return;
    }
    const payment = event.payload?.payment?.entity;
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
    }
    catch (error) {
        console.error("razorpay webhook processing failed", error);
        res.status(500).json({ error: "Failed to process webhook" });
    }
});
exports.default = router;
