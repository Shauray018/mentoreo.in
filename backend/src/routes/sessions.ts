import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import {
  createSessionChannel,
  deleteSessionChannel,
  sendPushToUser,
} from "../lib/sendbird";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();



// ─── POST /sessions/request ────────────────────────────────────────────────────
// Student requests a session with a specific mentor
router.post("/request", authMiddleware, async (req: Request, res: Response) => {
  const studentId = (req as any).user.id;
  const { mentorId } = req.body;

  if (!mentorId) {
    res.status(400).json({ error: "mentorId is required" });
    return;
  }

  // 1. Get mentor profile for rate
  const { data: mentorProfile, error: mentorError } = await supabase
    .from("mentor_profiles")
    .select("id, tier, rate_per_minute, is_available, signups(id, name)")
    .eq("id", mentorId)
    .single();

  if (mentorError || !mentorProfile) {
    res.status(404).json({ error: "Mentor not found" });
    return;
  }

  if (!mentorProfile.is_available) {
    res.status(400).json({ error: "Mentor is not available right now" });
    return;
  }

  // 2. Check if student already has a pending/active session
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("student_id", studentId)
    .in("status", ["pending", "active"])
    .single();

  if (existingSession) {
    res.status(400).json({ error: "You already have an active or pending session" });
    return;
  }

  // 3. Check student wallet balance — must have enough for 5 minutes minimum
  const { data: wallet, error: walletError } = await supabase
    .from("student_wallets")
    .select("balance")
    .eq("student_id", studentId)
    .single();

  if (walletError || !wallet) {
    res.status(400).json({ error: "Wallet not found" });
    return;
  }

  const minimumRequired = mentorProfile.rate_per_minute * 5;
  if (wallet.balance < minimumRequired) {
    res.status(400).json({
      error: `Insufficient balance. You need at least ₹${minimumRequired.toFixed(2)} for a session with this mentor`,
      required: minimumRequired,
      current: wallet.balance,
    });
    return;
  }

  // 4. Create session row
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      student_id: studentId,
      mentor_id: mentorId,
      rate_per_minute: mentorProfile.rate_per_minute,
      mentor_tier: mentorProfile.tier,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (sessionError || !session) {
    res.status(500).json({ error: "Failed to create session" });
    return;
  }

  // 5. Get student name for notification
  const { data: student } = await supabase
    .from("student_signups")
    .select("name")
    .eq("id", studentId)
    .single();

  // 6. Push notification to mentor
  const mentorSendbirdId = (mentorProfile.signups as any).id;
  await sendPushToUser(
    mentorSendbirdId,
    studentId,
    `${student?.name ?? "A student"} is requesting a session with you! You have 10 minutes to accept.`,
    {
      type: "session_request",
      sessionId: session.id,
      studentId,
      studentName: student?.name ?? "",
    }
  );

  res.status(201).json({
    message: "Session request sent",
    session: {
      id: session.id,
      status: session.status,
      expiresAt: session.expires_at,
      ratePerMinute: session.rate_per_minute,
    },
  });
});

// ─── POST /sessions/accept ─────────────────────────────────────────────────────
// Mentor accepts a session request
router.post("/accept", authMiddleware, async (req: Request, res: Response) => {
  const mentorId = (req as any).user.id;
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  // 1. Get session and validate
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("mentor_id", mentorId)
    .eq("status", "pending")
    .single();

  if (sessionError || !session) {
    res.status(404).json({ error: "Session not found or already handled" });
    return;
  }

  // 2. Check not expired
  if (new Date(session.expires_at) < new Date()) {
    await supabase
      .from("sessions")
      .update({ status: "expired" })
      .eq("id", sessionId);

    res.status(400).json({ error: "Session request has expired" });
    return;
  }

  // 3. Create Sendbird 1:1 channel
  const channelUrl = await createSessionChannel(
    session.student_id,
    mentorId,
    sessionId
  );

  if (!channelUrl) {
    res.status(500).json({ error: "Failed to create chat channel" });
    return;
  }

  const now = new Date().toISOString();

  // 4. Update session to active
  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "active",
      accepted_at: now,
      started_at: now,           // billing starts now
      sendbird_channel_url: channelUrl,
    })
    .eq("id", sessionId);

  if (updateError) {
    res.status(500).json({ error: "Failed to update session" });
    return;
  }

  // 5. Get mentor name for notification
  const { data: mentor } = await supabase
    .from("signups")
    .select("name")
    .eq("id", mentorId)
    .single();

  // 6. Push notification to student
  await sendPushToUser(
    session.student_id,
    mentorId,
    `${mentor?.name ?? "Your mentor"} has accepted your session request! Tap to start chatting.`,
    {
      type: "session_accepted",
      sessionId,
      mentorId,
      mentorName: mentor?.name ?? "",
      channelUrl,
    }
  );

  res.json({
    message: "Session accepted",
    session: {
      id: sessionId,
      status: "active",
      channelUrl,
      startedAt: now,
      ratePerMinute: session.rate_per_minute,
    },
  });
});

// ─── POST /sessions/decline ────────────────────────────────────────────────────
// Mentor declines a session request
router.post("/decline", authMiddleware, async (req: Request, res: Response) => {
  const mentorId = (req as any).user.id;
  const { sessionId } = req.body;

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("mentor_id", mentorId)
    .eq("status", "pending")
    .single();

  if (error || !session) {
    res.status(404).json({ error: "Session not found or already handled" });
    return;
  }

  await supabase
    .from("sessions")
    .update({ status: "declined" })
    .eq("id", sessionId);

  const { data: mentor } = await supabase
    .from("signups")
    .select("name")
    .eq("id", mentorId)
    .single();

  await sendPushToUser(
    session.student_id,
    mentorId,
    `${mentor?.name ?? "Your mentor"} is unavailable right now. Try another mentor.`,
    { type: "session_declined", sessionId }
  );

  res.json({ message: "Session declined" });
});

// ─── POST /sessions/cancel ─────────────────────────────────────────────────────
// Student cancels before mentor accepts
router.post("/cancel", authMiddleware, async (req: Request, res: Response) => {
  const studentId = (req as any).user.id;
  const { sessionId } = req.body;

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .eq("status", "pending")
    .single();

  if (error || !session) {
    res.status(404).json({ error: "Session not found or cannot be cancelled" });
    return;
  }

  await supabase
    .from("sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId);

  // Notify mentor the request was cancelled
  await sendPushToUser(
    session.mentor_id,
    studentId,
    "A session request was cancelled by the student.",
    { type: "session_cancelled", sessionId }
  );

  res.json({ message: "Session cancelled" });
});

// ─── POST /sessions/end ────────────────────────────────────────────────────────
// Either party ends the session — triggers billing
router.post("/end", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { sessionId } = req.body;

  // 1. Get session
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("status", "active")
    .single();

  if (error || !session) {
    res.status(404).json({ error: "Active session not found" });
    return;
  }

  // 2. Verify caller is part of this session
  const isStudent = session.student_id === userId;
  const isMentor = session.mentor_id === userId;

  if (!isStudent && !isMentor) {
    res.status(403).json({ error: "Not authorized to end this session" });
    return;
  }

  // 3. Calculate billing
  const endedAt = new Date();
  const startedAt = new Date(session.started_at);
  const durationSeconds = Math.floor(
    (endedAt.getTime() - startedAt.getTime()) / 1000
  );

  // Round up to nearest minute, minimum 1 minute charge
  const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
  const totalAmount = parseFloat(
    (durationMinutes * session.rate_per_minute).toFixed(2)
  );

  const endedBy = isStudent ? "student" : "mentor";

  // 4. Update session
  await supabase
    .from("sessions")
    .update({
      status: "completed",
      ended_at: endedAt.toISOString(),
      ended_by: endedBy,
      duration_seconds: durationSeconds,
      total_amount: totalAmount,
    })
    .eq("id", sessionId);

  // 5. Debit student wallet (with safety check on student_debited flag)
  if (!session.student_debited) {
    const { data: wallet } = await supabase
      .from("student_wallets")
      .select("balance")
      .eq("student_id", session.student_id)
      .single();

    const currentBalance = wallet?.balance ?? 0;
    const newBalance = Math.max(0, currentBalance - totalAmount);

    await supabase
      .from("student_wallets")
      .update({ balance: newBalance })
      .eq("student_id", session.student_id);

    // Log the transaction
    await supabase.from("student_wallet_transactions").insert({
      student_id: session.student_id,
      amount: -totalAmount,
      type: "session_debit",
      reference_id: sessionId,
      description: `Session with mentor — ${durationMinutes} min @ ₹${session.rate_per_minute}/min`,
      balance_after: newBalance,
    });

    // Mark debited
    await supabase
      .from("sessions")
      .update({ student_debited: true })
      .eq("id", sessionId);
  }

  // 6. Credit mentor earnings (with safety check)
  if (!session.mentor_credited) {
    const mentorShare = parseFloat((totalAmount * 0.8).toFixed(2)); // 80% to mentor

    await supabase.from("earnings").insert({
      mentor_id: session.mentor_id,
      session_id: sessionId,
      amount: mentorShare,
      status: "pending_payout",
    });

    await supabase
      .from("sessions")
      .update({ mentor_credited: true })
      .eq("id", sessionId);
  }

  // 7. Delete Sendbird channel
  if (session.sendbird_channel_url) {
    await deleteSessionChannel(session.sendbird_channel_url);
  }

  // 8. Notify the other party
  const otherUserId = isStudent ? session.mentor_id : session.student_id;
  await sendPushToUser(
    otherUserId,
    userId,
    `The session has ended. Duration: ${durationMinutes} min. Total: ₹${totalAmount}`,
    {
      type: "session_ended",
      sessionId,
      durationMinutes: String(durationMinutes),
      totalAmount: String(totalAmount),
    }
  );

  res.json({
    message: "Session ended",
    summary: {
      durationSeconds,
      durationMinutes,
      totalAmount,
      endedBy,
    },
  });
});

// ─── POST /sessions/expire ─────────────────────────────────────────────────────
// Called by a cron job (or manually) to expire timed-out pending sessions
// In production: call this every minute via a cron or Supabase scheduled function
router.post("/expire", async (_req: Request, res: Response) => {
  const { data: expiredSessions, error } = await supabase
    .from("sessions")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString())
    .select("id, student_id, mentor_id");

  if (error) {
    res.status(500).json({ error: "Failed to expire sessions" });
    return;
  }

  // Notify students their request expired
  for (const session of expiredSessions ?? []) {
    await sendPushToUser(
      session.student_id,
      "system",
      "Your session request expired — the mentor didn't respond in time. Try again or choose another mentor.",
      { type: "session_expired", sessionId: session.id }
    );
  }

  res.json({ expired: expiredSessions?.length ?? 0 });
});

// ─── GET /sessions/active ──────────────────────────────────────────────────────
// Get the current user's active or pending session
router.get("/active", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    res.json({ session: null });
    return;
  }

  res.json({ session: data });
});

// ─── GET /sessions/history ─────────────────────────────────────────────────────
// Past completed sessions for either a student or mentor
router.get("/history", authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt((req.query.page as string) ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("sessions")
    .select("*", { count: "exact" })
    .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
    .eq("status", "completed")
    .order("ended_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.status(500).json({ error: "Failed to fetch history" });
    return;
  }

  res.json({ sessions: data, total: count, page, limit });
});

export default router;