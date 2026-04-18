"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const mentors_1 = __importDefault(require("./routes/mentors"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const sendbird_1 = require("./lib/sendbird");
const supabase_1 = require("./lib/supabase");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/auth", auth_1.default);
app.use("/mentors", mentors_1.default);
app.use("/sessions", sessions_1.default);
app.use("/wallet", wallet_1.default);
// ─── SESSION EXPIRY RUNNER ─────────────────────────────────────────────────────
const expireSessions = async () => {
    try {
        const { data: expiredSessions, error } = await supabase_1.supabase
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
        const getMentorSendbirdId = async (mentorEmail) => {
            const { data } = await supabase_1.supabase
                .from("signups")
                .select("id")
                .eq("email", mentorEmail)
                .single();
            return data?.id ?? null;
        };
        if (expiredSessions && expiredSessions.length > 0) {
            console.log(`⏰ Expired ${expiredSessions.length} session(s)`);
            for (const session of expiredSessions) {
                await (0, sendbird_1.sendPushToUser)(session.student_id, "system", "Your session request expired — the mentor didn't respond in time. Try again or choose another mentor.", { type: "session_expired", sessionId: session.id });
                // Also notify mentor their pending request expired
                const mentorSendbirdId = await getMentorSendbirdId(session.mentor_email);
                if (mentorSendbirdId) {
                    await (0, sendbird_1.sendPushToUser)(mentorSendbirdId, "system", "A session request has expired.", { type: "session_expired", sessionId: session.id });
                }
            }
        }
    }
    catch (err) {
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
