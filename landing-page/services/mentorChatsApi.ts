export interface MentorChatRow {
  student: any;
  id: string;
  student_email: string;
  student_name?: string | null;
  student_avatar?: string | null;
  last_message?: string | null;
  updated_at: string;
  unread_count?: number | null;
  chat_rate?: number | null;
  call_rate?: number | null;
}

export async function fetchMentorChats(mentorEmail: string): Promise<MentorChatRow[]> {
  const res = await fetch(`/api/mentor-chats?mentor_email=${encodeURIComponent(mentorEmail)}`);
  return res.ok ? res.json() : [];
}
