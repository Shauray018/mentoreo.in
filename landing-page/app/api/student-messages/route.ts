import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/student-messages?chat_id=x
export async function GET(req: NextRequest) {
  const chat_id = req.nextUrl.searchParams.get("chat_id");
  if (!chat_id) return NextResponse.json({ error: "chat_id required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("student_messages")
    .select("*")
    .eq("chat_id", chat_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/student-messages — create message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chat_id, sender, body: messageBody } = body;

  if (!chat_id || !sender || !messageBody) {
    return NextResponse.json({ error: "chat_id, sender, body required" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("student_messages")
    .insert([{ chat_id, sender, body: messageBody }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
