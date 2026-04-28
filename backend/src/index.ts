import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth";
import mentorRoutes from "./routes/mentors";
import sessionRoutes from "./routes/sessions";
import walletRoutes from "./routes/wallet";
import { sendPushToUser } from "./lib/sendbird";
import { supabase } from "./lib/supabase";
import studentRoutes from "./routes/students";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/mentors", mentorRoutes);
app.use("/sessions", sessionRoutes);
app.use("/wallet", walletRoutes);
app.use("/students", studentRoutes);

// ─── SESSION EXPIRY RUNNER ─────────────────────────────────────────────────────
const expireSessions = async () => {
  try {
    const { data: expiredSessions, error } = await supabase
  .from("sessions")
  .update({ status: "expired" })
  .eq("status", "pending")
  .lt("expires_at", new Date().toISOString())
  .select("id, student_id, mentor_email"); // ← was mentor_id

    if (error) {
      console.error("Session expiry error:", error);
      return;
    }
    // Add this in index.ts above the expireSessions function
const getMentorSendbirdId = async (mentorEmail: string): Promise<string | null> => {
  const { data } = await supabase
    .from("signups")
    .select("id")
    .eq("email", mentorEmail)
    .single();
  return data?.id ?? null;
};

    if (expiredSessions && expiredSessions.length > 0) {
      console.log(`⏰ Expired ${expiredSessions.length} session(s)`);

      for (const session of expiredSessions) {
  await sendPushToUser(
    session.student_id,
    "system",
    "Your session request expired — the mentor didn't respond in time. Try again or choose another mentor.",
    { type: "session_expired", sessionId: session.id }
  );

  // Also notify mentor their pending request expired
  const mentorSendbirdId = await getMentorSendbirdId(session.mentor_email);
  if (mentorSendbirdId) {
    await sendPushToUser(
      mentorSendbirdId,
      "system",
      "A session request has expired.",
      { type: "session_expired", sessionId: session.id }
    );
  }
}
    }
  } catch (err) {
    console.error("Session expiry runner error:", err);
  }
};

// Run once on startup to catch any that expired while server was down
expireSessions();

// Then run every 60 seconds
setInterval(expireSessions, 60 * 1000);

// ──────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});