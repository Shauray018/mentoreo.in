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
  const data: MentorChatRow[] = res.ok ? await res.json() : [];
  if (!data.length) return data;
  const byStudent = new Map<string, MentorChatRow>();
  for (const chat of data) {
    const key = chat.student_email ?? chat.id;
    const prev = byStudent.get(key);
    if (!prev) {
      byStudent.set(key, chat);
      continue;
    }
    const prevTime = new Date(prev.updated_at).getTime();
    const nextTime = new Date(chat.updated_at).getTime();
    if (nextTime >= prevTime) byStudent.set(key, chat);
  }
  return Array.from(byStudent.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
