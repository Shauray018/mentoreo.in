import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/sessions?mentor_email=x
export async function GET(req: NextRequest) {
  const mentor_email = req.nextUrl.searchParams.get("mentor_email");
  if (!mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("sessions")
    .select("*")
    .eq("mentor_email", mentor_email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/sessions — create session
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });

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