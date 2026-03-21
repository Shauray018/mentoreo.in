import type { StudentProfile, StudentWallet, StudentWalletTx, StudentChat, StudentMessage } from "@/store/studentStore";

export async function fetchStudentProfile(email: string): Promise<StudentProfile | null> {
  const res = await fetch(`/api/student-profiles?email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : null;
}

export async function saveStudentProfileApi(email: string, patch: Partial<StudentProfile>): Promise<StudentProfile> {
  const res = await fetch(`/api/student-profiles?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...patch, email }),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function createStudentProfileApi(email: string, patch: Partial<StudentProfile>): Promise<StudentProfile | null> {
  const res = await fetch("/api/student-profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...patch, email }),
  });
  return res.ok ? res.json() : null;
}

export async function syncStudentSignup(email: string, patch: Partial<StudentProfile>): Promise<void> {
  await fetch(`/api/student-signups?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: patch.name, phone: patch.phone }),
  }).catch(() => {});
}

export async function fetchStudentWallet(email: string): Promise<StudentWallet | null> {
  const res = await fetch(`/api/student-wallet?email=${encodeURIComponent(email)}`);
  if (res.ok) return res.json();
  if (res.status === 404) {
    const create = await fetch("/api/student-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return create.ok ? create.json() : null;
  }
  return null;
}

export async function fetchStudentWalletTxs(email: string): Promise<StudentWalletTx[]> {
  const res = await fetch(`/api/student-wallet/transactions?email=${encodeURIComponent(email)}`);
  return res.ok ? res.json() : [];
}

export async function fetchStudentChats(email: string): Promise<StudentChat[]> {
  const res = await fetch(`/api/student-chats?student_email=${encodeURIComponent(email)}`);
  const data: StudentChat[] = res.ok ? await res.json() : [];
  if (!data.length) return data;
  const byMentor = new Map<string, StudentChat>();
  for (const chat of data) {
    const key = chat.mentor_email ?? chat.id;
    const prev = byMentor.get(key);
    if (!prev) {
      byMentor.set(key, chat);
      continue;
    }
    const prevTime = new Date(prev.updated_at).getTime();
    const nextTime = new Date(chat.updated_at).getTime();
    if (nextTime >= prevTime) byMentor.set(key, chat);
  }
  return Array.from(byMentor.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function createStudentChat(payload: {
  student_email: string;
  mentor_email: string;
  mentor_name?: string | null;
  mentor_avatar?: string | null;
  chat_rate?: number | null;
  call_rate?: number | null;
}): Promise<StudentChat> {
  const res = await fetch("/api/student-chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function fetchStudentMessages(chatId: string): Promise<StudentMessage[]> {
  const res = await fetch(`/api/student-messages?chat_id=${encodeURIComponent(chatId)}`);
  return res.ok ? res.json() : [];
}
