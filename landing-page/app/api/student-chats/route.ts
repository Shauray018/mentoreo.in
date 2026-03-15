import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/student-chats?student_email=x
export async function GET(req: NextRequest) {
  const student_email = req.nextUrl.searchParams.get("student_email");
  if (!student_email) {
    return NextResponse.json({ error: "student_email required" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("student_chats")
    .select("*")
    .eq("student_email", student_email)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/student-chats — create chat
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_email, mentor_email, mentor_name, mentor_avatar, chat_rate, call_rate } = body;

  if (!student_email || !mentor_email) {
    return NextResponse.json({ error: "student_email and mentor_email required" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("student_chats")
    .insert([{ student_email, mentor_email, mentor_name, mentor_avatar, chat_rate, call_rate }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/student-chats?id=x — update chat fields
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();
  const { data, error } = await supabaseServer
    .from("student_chats")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
