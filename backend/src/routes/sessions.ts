// import { Router, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import { supabase } from "../lib/supabase";
// import {
//   createSessionChannel,
//   freezeSessionChannel,
//   sendSessionChannelMessage,
//   sendPushToUser,
//   updateSessionChannelState,
// } from "../lib/sendbird";

// const router = Router();

// function authMiddleware(req: Request, res: Response, next: Function) {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) { res.status(401).json({ error: "No token provided" }); return; }
//   try {
//     (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
//     next();
//   } catch {
//     res.status(401).json({ error: "Invalid token" });
//   }
// }

// // Helper — get signups.id (Sendbird user ID) from mentor email
// async function getMentorSendbirdId(mentorEmail: string): Promise<string | null> {
//   const { data } = await supabase
//     .from("signups")
//     .select("id")
//     .eq("email", mentorEmail)
//     .single();
//   return data?.id ?? null;
// }

// // Helper — format paise to rupees string for display
// function toRupees(paise: number): string {
//   return (paise / 100).toFixed(2);
// }

// // ─── POST /sessions/request ────────────────────────────────────────────────────
// router.post("/request", authMiddleware, async (req: Request, res: Response) => {
//   const { id: studentId, email: studentEmail } = (req as any).user;
//   const { mentorEmail } = req.body;

//   if (!mentorEmail) {
//     res.status(400).json({ error: "mentorEmail is required" });
//     return;
//   }

//   // 1. Get mentor profile
//   const { data: mentor, error: mentorError } = await supabase
//     .from("mentor_profiles")
//     .select("email, display_name, tier, rate_per_minute, is_available")
//     .eq("email", mentorEmail)
//     .single();

//   if (mentorError || !mentor) {
//     res.status(404).json({ error: "Mentor not found" });
//     return;
//   }

//   if (!mentor.is_available) {
//     res.status(400).json({ error: "Mentor is not available right now" });
//     return;
//   }

//   // 2. Check student has no active/pending session already
//   const { data: existingSession } = await supabase
//     .from("sessions")
//     .select("id")
//     .eq("student_id", studentId)
//     .in("status", ["pending", "active"])
//     .maybeSingle();

//   if (existingSession) {
//     res.status(400).json({ error: "You already have an active or pending session" });
//     return;
//   }

//   // 3. Check wallet balance — minimum 5 minutes in paise
//   const { data: wallet, error: walletError } = await supabase
//     .from("student_wallets")
//     .select("balance_paise")
//     .eq("student_email", studentEmail)
//     .single();

//   if (walletError || !wallet) {
//     res.status(400).json({ error: "Wallet not found" });
//     return;
//   }

//   const ratePerMinutePaise = Math.round(mentor.rate_per_minute * 100);
//   const minimumPaise = ratePerMinutePaise * 5; // 5 min minimum

//   if (wallet.balance_paise < minimumPaise) {
//     res.status(400).json({
//       error: `Insufficient balance. You need at least ₹${toRupees(minimumPaise)} for a session with this mentor`,
//       requiredPaise: minimumPaise,
//       currentPaise: wallet.balance_paise,
//     });
//     return;
//   }

//   // 4. Create session row
//   const { data: session, error: sessionError } = await supabase
//     .from("sessions")
//     .insert({
//       student_id: studentId,
//       student_email: studentEmail,
//       mentor_email: mentorEmail,
//       rate_per_minute_paise: ratePerMinutePaise,
//       mentor_tier: mentor.tier,
//       status: "pending",
//     })
//     .select()
//     .single();

//   if (sessionError || !session) {
//     console.error(sessionError);
//     res.status(500).json({ error: "Failed to create session" });
//     return;
//   }

//   // 5. Get student name
//   const { data: student } = await supabase
//     .from("student_signups")
//     .select("name")
//     .eq("id", studentId)
//     .single();

//   // 6. Create a pending Sendbird channel and message the mentor.
//   // Sendbird handles the device push through its configured notification pipeline.
//   const mentorSendbirdId = await getMentorSendbirdId(mentorEmail);
//   let channelUrl: string | null = null;
//   let requestMessageSent = false;

//   if (mentorSendbirdId) {
//     channelUrl = await createSessionChannel(
//       studentId,
//       mentorSendbirdId,
//       session.id,
//       mentorEmail,
//       "pending"
//     );

//     if (channelUrl) {
//       await supabase
//         .from("sessions")
//         .update({ sendbird_channel_url: channelUrl })
//         .eq("id", session.id);

//       requestMessageSent = await sendSessionChannelMessage(
//         channelUrl,
//         studentId,
//         `${student?.name ?? "A student"} is requesting a session! You have 10 minutes to accept.`,
//         "session_request",
//         {
//           type: "session_request",
//           sessionId: session.id,
//           studentId,
//           studentName: student?.name ?? "",
//           studentEmail,
//         }
//       );
//     }
//   } else {
//     console.error("Mentor Sendbird user not found:", mentorEmail);
//   }

//   const notification = {
//     sendbirdChannelCreated: Boolean(channelUrl),
//     sendbirdMessageSent: requestMessageSent,
//   };

//   if (!requestMessageSent && mentorSendbirdId) {
//     await sendPushToUser(
//       mentorSendbirdId,
//       studentId,
//       `${student?.name ?? "A student"} is requesting a session! You have 10 minutes to accept.`,
//       {
//         type: "session_request",
//         sessionId: session.id,
//         studentId,
//         studentName: student?.name ?? "",
//         studentEmail,
//       }
//     );
//   }

//   res.status(201).json({
//     message: "Session request sent",
//     session: {
//       id: session.id,
//       status: session.status,
//       expiresAt: session.expires_at,
//       ratePerMinutePaise,
//       ratePerMinuteRupees: mentor.rate_per_minute,
//       channelUrl,
//     },
//     notification,
//   });
// });

// // ─── POST /sessions/accept ─────────────────────────────────────────────────────
// router.post("/accept", authMiddleware, async (req: Request, res: Response) => {
//   const { email: mentorEmail, id: mentorSignupId } = (req as any).user;
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     res.status(400).json({ error: "sessionId is required" });
//     return;
//   }

//   // 1. Get session
//   const { data: session, error } = await supabase
//     .from("sessions")
//     .select("*")
//     .eq("id", sessionId)
//     .eq("mentor_email", mentorEmail)
//     .eq("status", "pending")
//     .single();

//   if (error || !session) {
//     res.status(404).json({ error: "Session not found or already handled" });
//     return;
//   }

//   // 2. Check not expired
//   if (new Date(session.expires_at) < new Date()) {
//     await supabase.from("sessions").update({ status: "expired" }).eq("id", sessionId);
//     res.status(400).json({ error: "Session request has expired" });
//     return;
//   }

//   // 3. Reuse the pending Sendbird channel created during request.
//   console.log("Resolving Sendbird session channel:", {
//     studentId: session.student_id,
//     mentorId: mentorSignupId,
//     sessionId,
//   });

//   const channelUrl =
//     session.sendbird_channel_url ??
//     (await createSessionChannel(
//       session.student_id,  // student UUID = their Sendbird ID
//       mentorSignupId,      // mentor signups.id = their Sendbird ID
//       sessionId,
//       mentorEmail,
//       "active"
//     ));

//   if (!channelUrl) {
//     res.status(500).json({ error: "Failed to create chat channel" });
//     return;
//   }

//   await updateSessionChannelState(channelUrl, "active");

//   const now = new Date().toISOString();

//   // 4. Update session to active
//   await supabase
//     .from("sessions")
//     .update({
//       status: "active",
//       accepted_at: now,
//       started_at: now,
//       sendbird_channel_url: channelUrl,
//     })
//     .eq("id", sessionId);

//   // 5. Get mentor display name
//   const { data: mentorProfile } = await supabase
//     .from("mentor_profiles")
//     .select("display_name")
//     .eq("email", mentorEmail)
//     .single();

//   const mentorName = mentorProfile?.display_name ?? mentorEmail;

//   // 6. Message student in the Sendbird channel, which drives Sendbird push.
//   const acceptedMessageSent = await sendSessionChannelMessage(
//     channelUrl,
//     mentorSignupId,
//     `${mentorName} accepted your session request! Tap to start chatting.`,
//     "session_accepted",
//     {
//       type: "session_accepted",
//       sessionId,
//       mentorEmail,
//       mentorName,
//       channelUrl,
//     }
//   );
//   const notification = { sendbirdMessageSent: acceptedMessageSent };

//   res.json({
//     message: "Session accepted",
//     session: {
//       id: sessionId,
//       status: "active",
//       channelUrl,
//       startedAt: now,
//       ratePerMinutePaise: session.rate_per_minute_paise,
//     },
//     notification,
//   });
// });

// // ─── POST /sessions/decline ────────────────────────────────────────────────────
// router.post("/decline", authMiddleware, async (req: Request, res: Response) => {
//   const { email: mentorEmail, id: mentorSignupId } = (req as any).user;
//   const { sessionId } = req.body;

//   const { data: session, error } = await supabase
//     .from("sessions")
//     .select("*")
//     .eq("id", sessionId)
//     .eq("mentor_email", mentorEmail)
//     .eq("status", "pending")
//     .single();

//   if (error || !session) {
//     res.status(404).json({ error: "Session not found or already handled" });
//     return;
//   }

//   await supabase.from("sessions").update({ status: "declined" }).eq("id", sessionId);

//   const { data: mentorProfile } = await supabase
//     .from("mentor_profiles")
//     .select("display_name")
//     .eq("email", mentorEmail)
//     .single();

//   const declinedMessage = `${mentorProfile?.display_name ?? "Your mentor"} is unavailable right now. Try another mentor.`;
//   const notification = {
//     sendbirdMessageSent: session.sendbird_channel_url
//       ? await sendSessionChannelMessage(
//           session.sendbird_channel_url,
//           mentorSignupId,
//           declinedMessage,
//           "session_declined",
//           { type: "session_declined", sessionId }
//         )
//       : false,
//   };

//   if (!notification.sendbirdMessageSent) {
//     await sendPushToUser(
//       session.student_id,
//       mentorSignupId,
//       declinedMessage,
//       { type: "session_declined", sessionId }
//     );
//   }

//   res.json({ message: "Session declined", notification });
// });

// // ─── POST /sessions/cancel ─────────────────────────────────────────────────────
// router.post("/cancel", authMiddleware, async (req: Request, res: Response) => {
//   const { id: studentId } = (req as any).user;
//   const { sessionId } = req.body;

//   const { data: session, error } = await supabase
//     .from("sessions")
//     .select("*")
//     .eq("id", sessionId)
//     .eq("student_id", studentId)
//     .eq("status", "pending")
//     .single();

//   if (error || !session) {
//     res.status(404).json({ error: "Session not found or cannot be cancelled" });
//     return;
//   }

//   await supabase.from("sessions").update({ status: "cancelled" }).eq("id", sessionId);

//   const mentorSendbirdId = await getMentorSendbirdId(session.mentor_email);
//   const notification = {
//     sendbirdMessageSent: session.sendbird_channel_url
//       ? await sendSessionChannelMessage(
//           session.sendbird_channel_url,
//           studentId,
//           "A session request was cancelled by the student.",
//           "session_cancelled",
//           { type: "session_cancelled", sessionId }
//         )
//       : false,
//   };

//   if (!notification.sendbirdMessageSent && mentorSendbirdId) {
//     await sendPushToUser(
//       mentorSendbirdId,
//       studentId,
//       "A session request was cancelled by the student.",
//       { type: "session_cancelled", sessionId }
//     );
//   }

//   res.json({ message: "Session cancelled", notification });
// });

// // ─── POST /sessions/end ────────────────────────────────────────────────────────
// router.post("/end", authMiddleware, async (req: Request, res: Response) => {
//   const { id: userId, email: userEmail } = (req as any).user;
//   const { sessionId } = req.body;

//   const { data: session, error } = await supabase
//     .from("sessions")
//     .select("*")
//     .eq("id", sessionId)
//     .eq("status", "active")
//     .single();

//   if (error || !session) {
//     res.status(404).json({ error: "Active session not found" });
//     return;
//   }

//   // Verify caller is part of this session
//   const isStudent = session.student_id === userId;
//   const isMentor = session.mentor_email === userEmail;

//   if (!isStudent && !isMentor) {
//     res.status(403).json({ error: "Not authorized to end this session" });
//     return;
//   }

//   // Calculate billing in paise
//   const endedAt = new Date();
//   const startedAt = new Date(session.started_at);
//   const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
//   const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
//   const totalAmountPaise = durationMinutes * session.rate_per_minute_paise;
//   const endedBy = isStudent ? "student" : "mentor";

//   // Update session
//   await supabase
//     .from("sessions")
//     .update({
//       status: "completed",
//       ended_at: endedAt.toISOString(),
//       ended_by: endedBy,
//       duration_seconds: durationSeconds,
//       total_amount_paise: totalAmountPaise,
//     })
//     .eq("id", sessionId);

//   // Debit student wallet (safety: check student_debited flag)
//   if (!session.student_debited) {
//     const { data: wallet } = await supabase
//       .from("student_wallets")
//       .select("balance_paise")
//       .eq("student_email", session.student_email)
//       .single();

//     const currentBalance = wallet?.balance_paise ?? 0;
//     const newBalance = Math.max(0, currentBalance - totalAmountPaise);

//     await supabase
//       .from("student_wallets")
//       .update({ balance_paise: newBalance })
//       .eq("student_email", session.student_email);

//     await supabase.from("student_wallet_transactions").insert({
//       student_email: session.student_email,
//       amount_paise: -totalAmountPaise,
//       type: "session_debit",
//       reference_id: sessionId,
//       description: `Session with mentor — ${durationMinutes} min @ ₹${toRupees(session.rate_per_minute_paise)}/min`,
//       balance_after_paise: newBalance,
//     });

//     await supabase
//       .from("sessions")
//       .update({ student_debited: true })
//       .eq("id", sessionId);
//   }

//   // Credit mentor earnings (80% cut)
//   if (!session.mentor_credited) {
//     const mentorSharePaise = Math.floor(totalAmountPaise * 0.8);

//     await supabase.from("earnings").insert({
//       mentor_email: session.mentor_email,
//       session_id: sessionId,
//       amount_paise: mentorSharePaise,
//       status: "pending_payout",
//     });

//     await supabase
//       .from("sessions")
//       .update({ mentor_credited: true })
//       .eq("id", sessionId);
//   }

//   // Freeze and mark Sendbird channel as ended (best effort)
//   if (session.sendbird_channel_url) {
//     try {
//       const freezeOk = await freezeSessionChannel(session.sendbird_channel_url);
//       console.log("Sendbird channel freeze result:", {
//         channelUrl: session.sendbird_channel_url,
//         success: freezeOk,
//       });
//     } catch (freezeError) {
//       console.error("Failed to freeze Sendbird channel:", {
//         channelUrl: session.sendbird_channel_url,
//         error: freezeError,
//       });
//     }

//     try {
//       const stateOk = await updateSessionChannelState(session.sendbird_channel_url, "ended");
//       console.log("Sendbird channel state update result:", {
//         channelUrl: session.sendbird_channel_url,
//         state: "ended",
//         success: stateOk,
//       });
//     } catch (stateError) {
//       console.error("Failed to update Sendbird channel state:", {
//         channelUrl: session.sendbird_channel_url,
//         state: "ended",
//         error: stateError,
//       });
//     }
//   }

//   // Notify other party
//   const mentorSendbirdId = await getMentorSendbirdId(session.mentor_email);
//   let notification: { sendbirdMessageSent: boolean } | null = null;
//   if (isStudent) {
//     const message = `Session ended by student. Duration: ${durationMinutes} min. Earned: ₹${toRupees(Math.floor(totalAmountPaise * 0.8))}`;
//     notification = {
//       sendbirdMessageSent: session.sendbird_channel_url
//         ? await sendSessionChannelMessage(
//             session.sendbird_channel_url,
//             userId,
//             message,
//             "session_ended",
//             { type: "session_ended", sessionId, durationMinutes: String(durationMinutes) }
//           )
//         : false,
//     };

//     if (!notification.sendbirdMessageSent && mentorSendbirdId) {
//       await sendPushToUser(
//         mentorSendbirdId,
//         userId,
//         message,
//         { type: "session_ended", sessionId, durationMinutes: String(durationMinutes) }
//       );
//     }
//   } else if (isMentor) {
//     const message = `Session ended. Duration: ${durationMinutes} min. Charged: ₹${toRupees(totalAmountPaise)}`;
//     notification = {
//       sendbirdMessageSent: session.sendbird_channel_url
//         ? await sendSessionChannelMessage(
//             session.sendbird_channel_url,
//             userId,
//             message,
//             "session_ended",
//             { type: "session_ended", sessionId, durationMinutes: String(durationMinutes) }
//           )
//         : false,
//     };

//     if (!notification.sendbirdMessageSent) {
//       await sendPushToUser(
//         session.student_id,
//         userId,
//         message,
//         { type: "session_ended", sessionId, durationMinutes: String(durationMinutes) }
//       );
//     }
//   }

//   res.json({
//     message: "Session ended",
//     summary: {
//       durationSeconds,
//       durationMinutes,
//       totalAmountPaise,
//       totalAmountRupees: toRupees(totalAmountPaise),
//       endedBy,
//     },
//     notification,
//   });
// });

// // ─── GET /sessions/active ──────────────────────────────────────────────────────
// router.get("/active", authMiddleware, async (req: Request, res: Response) => {
//   const { id: userId, email: userEmail } = (req as any).user;

//   const { data, error } = await supabase
//     .from("sessions")
//     .select("*")
//     .or(`student_id.eq.${userId},mentor_email.eq.${userEmail}`)
//     .in("status", ["pending", "active"])
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .maybeSingle();

//   if (error) {
//     res.status(500).json({ error: "Failed to fetch active session" });
//     return;
//   }

//   res.json({ session: data ?? null });
// });

// // ─── GET /sessions/history ─────────────────────────────────────────────────────
// router.get("/history", authMiddleware, async (req: Request, res: Response) => {
//   const { id: userId, email: userEmail } = (req as any).user;
//   const page = parseInt((req.query.page as string) ?? "1");
//   const limit = 20;
//   const offset = (page - 1) * limit;

//   const { data, error, count } = await supabase
//     .from("sessions")
//     .select("*", { count: "exact" })
//     .or(`student_id.eq.${userId},mentor_email.eq.${userEmail}`)
//     .eq("status", "completed")
//     .order("ended_at", { ascending: false })
//     .range(offset, offset + limit - 1);

//   if (error) {
//     res.status(500).json({ error: "Failed to fetch history" });
//     return;
//   }

//   res.json({ sessions: data, total: count, page, limit });
// });

// export default router;
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";
import {
  createSessionChannel,
  freezeSessionChannel,
  sendSessionChannelMessage,
  updateSessionChannelState,
} from "../lib/sendbird";
import { pushToUser } from "../lib/expoPush";

const router = Router();

function authMiddleware(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) { res.status(401).json({ error: "No token provided" }); return; }
  try {
    (req as any).user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Helper — format paise to rupees string for display
function toRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

// ─── POST /sessions/request ────────────────────────────────────────────────────
router.post("/request", authMiddleware, async (req: Request, res: Response) => {
  const { id: studentId, email: studentEmail } = (req as any).user;
  const { mentorEmail } = req.body;

  if (!mentorEmail) {
    res.status(400).json({ error: "mentorEmail is required" });
    return;
  }

  // 1. Get mentor profile
  const { data: mentor, error: mentorError } = await supabase
    .from("mentor_profiles")
    .select("email, display_name, tier, rate_per_minute, is_available")
    .eq("email", mentorEmail)
    .single();

  if (mentorError || !mentor) {
    res.status(404).json({ error: "Mentor not found" });
    return;
  }

  if (!mentor.is_available) {
    res.status(400).json({ error: "Mentor is not available right now" });
    return;
  }

  // 2. Check student has no active/pending session already
  const { data: existingSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("student_id", studentId)
    .in("status", ["pending", "active"])
    .maybeSingle();

  if (existingSession) {
    res.status(400).json({ error: "You already have an active or pending session" });
    return;
  }

  // 3. Check wallet balance — minimum 5 minutes in paise
  const { data: wallet, error: walletError } = await supabase
    .from("student_wallets")
    .select("balance_paise")
    .eq("student_email", studentEmail)
    .single();

  if (walletError || !wallet) {
    res.status(400).json({ error: "Wallet not found" });
    return;
  }

  const ratePerMinutePaise = Math.round(mentor.rate_per_minute * 100);
  const minimumPaise = ratePerMinutePaise * 5;

  if (wallet.balance_paise < minimumPaise) {
    res.status(400).json({
      error: `Insufficient balance. You need at least ₹${toRupees(minimumPaise)} for a session with this mentor`,
      requiredPaise: minimumPaise,
      currentPaise: wallet.balance_paise,
    });
    return;
  }

  // 4. Create session row
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      student_id: studentId,
      student_email: studentEmail,
      mentor_email: mentorEmail,
      rate_per_minute_paise: ratePerMinutePaise,
      mentor_tier: mentor.tier,
      status: "pending",
    })
    .select()
    .single();

  if (sessionError || !session) {
    console.error(sessionError);
    res.status(500).json({ error: "Failed to create session" });
    return;
  }

  // 5. Get student name
  const { data: student } = await supabase
    .from("student_signups")
    .select("name")
    .eq("id", studentId)
    .single();

  const studentName = student?.name ?? "A student";

  // 6. Create Sendbird channel for in-app chat
  // NOTE: Sendbird is ONLY used for the chat UI — push is handled separately below.
  let channelUrl: string | null = null;

  // Look up the mentor's Sendbird ID (their signups.id UUID)
  const { data: mentorSignup } = await supabase
    .from("signups")
    .select("id")
    .eq("email", mentorEmail)
    .single();

  const mentorSendbirdId = mentorSignup?.id ?? null;

  if (mentorSendbirdId) {
    channelUrl = await createSessionChannel(
      studentId,
      mentorSendbirdId,
      session.id,
      mentorEmail,
      "pending"
    );

    if (channelUrl) {
      await supabase
        .from("sessions")
        .update({ sendbird_channel_url: channelUrl })
        .eq("id", session.id);

      // Send a silent in-channel message (for chat history / UIKit event)
      await sendSessionChannelMessage(
        channelUrl,
        studentId,
        `${studentName} is requesting a session! You have 10 minutes to accept.`,
        "session_request",
        {
          type: "session_request",
          sessionId: session.id,
          studentId,
          studentName,
          studentEmail,
        }
      );
    }
  }

  // 7. Push to ONLY the requested mentor via Expo
  const pushed = await pushToUser(supabase, mentorEmail, {
    title: "New Session Request",
    body: `${studentName} wants to start a session with you!`,
    data: {
      type: "session_request",
      sessionId: session.id,
      studentId,
      studentName,
      studentEmail,
    },
  });

  if (!pushed) {
    console.warn("sessions/request: Expo push failed for mentor", mentorEmail);
  }

  res.status(201).json({
    message: "Session request sent",
    session: {
      id: session.id,
      status: session.status,
      expiresAt: session.expires_at,
      ratePerMinutePaise,
      ratePerMinuteRupees: mentor.rate_per_minute,
      channelUrl,
    },
    notification: { expoPushSent: pushed },
  });
});

// ─── POST /sessions/accept ─────────────────────────────────────────────────────
router.post("/accept", authMiddleware, async (req: Request, res: Response) => {
  const { email: mentorEmail, id: mentorSignupId } = (req as any).user;
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  // 1. Get session
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("mentor_email", mentorEmail)
    .eq("status", "pending")
    .single();

  if (error || !session) {
    res.status(404).json({ error: "Session not found or already handled" });
    return;
  }

  // 2. Check not expired
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from("sessions").update({ status: "expired" }).eq("id", sessionId);
    res.status(400).json({ error: "Session request has expired" });
    return;
  }

  // 3. Reuse or create Sendbird channel
  const channelUrl =
    session.sendbird_channel_url ??
    (await createSessionChannel(
      session.student_id,
      mentorSignupId,
      sessionId,
      mentorEmail,
      "active"
    ));

  if (!channelUrl) {
    res.status(500).json({ error: "Failed to create chat channel" });
    return;
  }

  await updateSessionChannelState(channelUrl, "active");

  const now = new Date().toISOString();

  // 4. Update session to active
  await supabase
    .from("sessions")
    .update({
      status: "active",
      accepted_at: now,
      started_at: now,
      sendbird_channel_url: channelUrl,
    })
    .eq("id", sessionId);

  // 5. Get mentor display name
  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("display_name")
    .eq("email", mentorEmail)
    .single();

  const mentorName = mentorProfile?.display_name ?? mentorEmail;

  // 6. In-channel message for the chat UI (best effort)
  await sendSessionChannelMessage(
    channelUrl,
    mentorSignupId,
    `${mentorName} accepted your session request! Tap to start chatting.`,
    "session_accepted",
    {
      type: "session_accepted",
      sessionId,
      mentorEmail,
      mentorName,
      channelUrl,
    }
  );

  // 7. Push to ONLY the student via Expo
  const pushed = await pushToUser(supabase, session.student_email, {
    title: "Session Accepted!",
    body: `${mentorName} is ready for your session. Tap to open the chat.`,
    data: {
      type: "session_accepted",
      sessionId,
      mentorEmail,
      mentorName,
      channelUrl,
    },
  });

  if (!pushed) {
    console.warn("sessions/accept: Expo push failed for student", session.student_email);
  }

  res.json({
    message: "Session accepted",
    session: {
      id: sessionId,
      status: "active",
      channelUrl,
      startedAt: now,
      ratePerMinutePaise: session.rate_per_minute_paise,
    },
    notification: { expoPushSent: pushed },
  });
});

// ─── POST /sessions/decline ────────────────────────────────────────────────────
router.post("/decline", authMiddleware, async (req: Request, res: Response) => {
  const { email: mentorEmail, id: mentorSignupId } = (req as any).user;
  const { sessionId } = req.body;

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("mentor_email", mentorEmail)
    .eq("status", "pending")
    .single();

  if (error || !session) {
    res.status(404).json({ error: "Session not found or already handled" });
    return;
  }

  await supabase.from("sessions").update({ status: "declined" }).eq("id", sessionId);

  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("display_name")
    .eq("email", mentorEmail)
    .single();

  const mentorName = mentorProfile?.display_name ?? "Your mentor";

  // In-channel message (best effort)
  if (session.sendbird_channel_url) {
    await sendSessionChannelMessage(
      session.sendbird_channel_url,
      mentorSignupId,
      `${mentorName} is unavailable right now. Try another mentor.`,
      "session_declined",
      { type: "session_declined", sessionId }
    );
  }

  // Push ONLY the student
  const pushed = await pushToUser(supabase, session.student_email, {
    title: "Session Declined",
    body: `${mentorName} is unavailable right now. Try another mentor.`,
    data: { type: "session_declined", sessionId },
  });

  res.json({ message: "Session declined", notification: { expoPushSent: pushed } });
});

// ─── POST /sessions/cancel ─────────────────────────────────────────────────────
router.post("/cancel", authMiddleware, async (req: Request, res: Response) => {
  const { id: studentId, email: studentEmail } = (req as any).user;
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

  await supabase.from("sessions").update({ status: "cancelled" }).eq("id", sessionId);

  // In-channel message (best effort)
  if (session.sendbird_channel_url) {
    await sendSessionChannelMessage(
      session.sendbird_channel_url,
      studentId,
      "A session request was cancelled by the student.",
      "session_cancelled",
      { type: "session_cancelled", sessionId }
    );
  }

  // Push ONLY the mentor
  const pushed = await pushToUser(supabase, session.mentor_email, {
    title: "Session Cancelled",
    body: "A student cancelled their session request.",
    data: { type: "session_cancelled", sessionId },
  });

  res.json({ message: "Session cancelled", notification: { expoPushSent: pushed } });
});

// ─── POST /sessions/end ────────────────────────────────────────────────────────
router.post("/end", authMiddleware, async (req: Request, res: Response) => {
  const { id: userId, email: userEmail } = (req as any).user;
  const { sessionId } = req.body;

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

  const isStudent = session.student_id === userId;
  const isMentor = session.mentor_email === userEmail;

  if (!isStudent && !isMentor) {
    res.status(403).json({ error: "Not authorized to end this session" });
    return;
  }

  // Calculate billing
  const endedAt = new Date();
  const startedAt = new Date(session.started_at);
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
  const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
  const totalAmountPaise = durationMinutes * session.rate_per_minute_paise;
  const endedBy = isStudent ? "student" : "mentor";

  // Update session
  await supabase
    .from("sessions")
    .update({
      status: "completed",
      ended_at: endedAt.toISOString(),
      ended_by: endedBy,
      duration_seconds: durationSeconds,
      total_amount_paise: totalAmountPaise,
    })
    .eq("id", sessionId);

  // Debit student wallet
  if (!session.student_debited) {
    const { data: wallet } = await supabase
      .from("student_wallets")
      .select("balance_paise")
      .eq("student_email", session.student_email)
      .single();

    const currentBalance = wallet?.balance_paise ?? 0;
    const newBalance = Math.max(0, currentBalance - totalAmountPaise);

    await supabase
      .from("student_wallets")
      .update({ balance_paise: newBalance })
      .eq("student_email", session.student_email);

    await supabase.from("student_wallet_transactions").insert({
      student_email: session.student_email,
      amount_paise: -totalAmountPaise,
      type: "session_debit",
      reference_id: sessionId,
      description: `Session with mentor — ${durationMinutes} min @ ₹${toRupees(session.rate_per_minute_paise)}/min`,
      balance_after_paise: newBalance,
    });

    await supabase
      .from("sessions")
      .update({ student_debited: true })
      .eq("id", sessionId);
  }

  // Credit mentor earnings (80% cut)
  if (!session.mentor_credited) {
    const mentorSharePaise = Math.floor(totalAmountPaise * 0.8);

    await supabase.from("earnings").insert({
      mentor_email: session.mentor_email,
      session_id: sessionId,
      amount_paise: mentorSharePaise,
      status: "pending_payout",
    });

    await supabase
      .from("sessions")
      .update({ mentor_credited: true })
      .eq("id", sessionId);
  }

  // Freeze Sendbird channel (best effort — don't block response)
  if (session.sendbird_channel_url) {
    freezeSessionChannel(session.sendbird_channel_url).catch((e) =>
      console.error("Failed to freeze Sendbird channel:", e)
    );
    updateSessionChannelState(session.sendbird_channel_url, "ended").catch((e) =>
      console.error("Failed to update Sendbird channel state:", e)
    );
  }

  // Push the OTHER party
  let pushed = false;

  if (isStudent) {
    // Student ended → push mentor
    pushed = await pushToUser(supabase, session.mentor_email, {
      title: "Session Ended",
      body: `Session ended by student. Duration: ${durationMinutes} min. Earned: ₹${toRupees(Math.floor(totalAmountPaise * 0.8))}`,
      data: {
        type: "session_ended",
        sessionId,
        durationMinutes: String(durationMinutes),
        endedBy: "student",
      },
    });
  } else {
    // Mentor ended → push student
    pushed = await pushToUser(supabase, session.student_email, {
      title: "Session Ended",
      body: `Session ended. Duration: ${durationMinutes} min. Charged: ₹${toRupees(totalAmountPaise)}`,
      data: {
        type: "session_ended",
        sessionId,
        durationMinutes: String(durationMinutes),
        endedBy: "mentor",
      },
    });
  }

  res.json({
    message: "Session ended",
    summary: {
      durationSeconds,
      durationMinutes,
      totalAmountPaise,
      totalAmountRupees: toRupees(totalAmountPaise),
      endedBy,
    },
    notification: { expoPushSent: pushed },
  });
});

// ─── GET /sessions/active ──────────────────────────────────────────────────────
router.get("/active", authMiddleware, async (req: Request, res: Response) => {
  const { id: userId, email: userEmail } = (req as any).user;

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .or(`student_id.eq.${userId},mentor_email.eq.${userEmail}`)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: "Failed to fetch active session" });
    return;
  }

  res.json({ session: data ?? null });
});

// ─── GET /sessions/history ─────────────────────────────────────────────────────
router.get("/history", authMiddleware, async (req: Request, res: Response) => {
  const { id: userId, email: userEmail } = (req as any).user;
  const page = parseInt((req.query.page as string) ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("sessions")
    .select("*", { count: "exact" })
    .or(`student_id.eq.${userId},mentor_email.eq.${userEmail}`)
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