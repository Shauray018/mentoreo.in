"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "No token" });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
}
// GET /wallet/balance
router.get("/balance", authMiddleware, async (req, res) => {
    const { email } = req.user;
    const { data, error } = await supabase_1.supabase
        .from("student_wallets")
        .select("balance_paise")
        .eq("student_email", email)
        .single();
    if (error || !data) {
        res.status(404).json({ error: "Wallet not found" });
        return;
    }
    res.json({ balance: data.balance_paise, balanceRupees: (data.balance_paise / 100).toFixed(2) });
});
// GET /wallet/transactions
router.get("/transactions", authMiddleware, async (req, res) => {
    const { email } = req.user;
    const page = parseInt(req.query.page ?? "1");
    const limit = 20;
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase_1.supabase
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
exports.default = router;
