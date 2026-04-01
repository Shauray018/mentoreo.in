import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/sessions?mentor_email=x  OR  /api/sessions?student_email=x
export async function GET(req: NextRequest) {
  const mentor_email = req.nextUrl.searchParams.get("mentor_email");
  const student_email = req.nextUrl.searchParams.get("student_email");

  if (!mentor_email && !student_email)
    return NextResponse.json({ error: "mentor_email or student_email required" }, { status: 400 });

  let query = supabaseServer.from("sessions").select("*");
  if (mentor_email) query = query.eq("mentor_email", mentor_email);
  if (student_email) query = query.eq("student_email", student_email);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/sessions — create session
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });
  if (!body.student_email) return NextResponse.json({ error: "student_email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("sessions")
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/sessions?id=x — update session (e.g. accept/decline)
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("sessions")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/sessions?id=x
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseServer
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
