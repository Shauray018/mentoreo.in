// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
// Simple JWT auth middleware — validates the token from signin
import jwt from "jsonwebtoken";
import { Router, Request, Response } from "express";

export function authMiddleware(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
      role?: string;
    };
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}