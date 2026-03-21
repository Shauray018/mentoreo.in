import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/mentor-chats?mentor_email=x
export async function GET(req: NextRequest) {
  const mentor_email = req.nextUrl.searchParams.get("mentor_email");
  if (!mentor_email) {
    return NextResponse.json({ error: "mentor_email required" }, { status: 400 });
  }

  const { data: chats, error } = await supabaseServer
    .from("student_chats")
    .select("*")
    .eq("mentor_email", mentor_email)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const studentEmails = (chats ?? []).map((c) => c.student_email).filter(Boolean);
  const { data: profiles } = await supabaseServer
    .from("student_profiles")
    .select("email, name, avatar_url")
    .in("email", studentEmails);

  const profileByEmail = new Map((profiles ?? []).map((p) => [p.email as string, p]));
  const enriched = (chats ?? []).map((c) => {
    const profile = profileByEmail.get(c.student_email as string);
    return {
      ...c,
      student_name: profile?.name ?? c.student_email,
      student_avatar: profile?.avatar_url ?? null,
    };
  });

  return NextResponse.json(enriched);
}
