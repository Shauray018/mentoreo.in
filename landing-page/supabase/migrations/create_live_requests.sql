-- Live requests table: replaces ephemeral Supabase broadcast for live connect flow.
-- To revert: DROP TABLE live_requests;

CREATE TABLE IF NOT EXISTS live_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_email TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  student_image TEXT,
  mentor_email  TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'chat',   -- 'chat' | 'call'
  topic         TEXT NOT NULL DEFAULT 'Mentoring',
  rate          NUMERIC NOT NULL DEFAULT 5,
  status        TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'expired'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 minutes')
);

-- Mentor fetches their pending requests
CREATE INDEX idx_live_requests_mentor_status ON live_requests (mentor_email, status);

-- Student polls their own request status
CREATE INDEX idx_live_requests_student ON live_requests (student_email, status);

-- Cleanup old rows (optional cron or app-level)
CREATE INDEX idx_live_requests_expires ON live_requests (expires_at);

-- Enable realtime so clients can subscribe to postgres_changes
ALTER PUBLICATION supabase_realtime ADD TABLE live_requests;
