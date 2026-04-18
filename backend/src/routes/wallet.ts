import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";

const router = Router();

function authMiddleware(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) { res.status(401).json({ error: "No token" }); return; }
  try {
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// GET /wallet/balance
router.get("/balance", authMiddleware, async (req: Request, res: Response) => {
  const { email } = (req as any).user; 

  const { data, error } = await supabase
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
router.get("/transactions", authMiddleware, async (req: Request, res: Response) => {
  const { email } = (req as any).user; 
  const page = parseInt((req.query.page as string) ?? "1");
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

export default router;