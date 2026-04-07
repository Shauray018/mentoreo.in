import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/live-requests?mentor_email=x  — fetch pending live requests for a mentor
// GET /api/live-requests?student_email=x&id=y — student polls their request status
export async function GET(req: NextRequest) {
  const mentorEmail = req.nextUrl.searchParams.get("mentor_email");
  const studentEmail = req.nextUrl.searchParams.get("student_email");
  const id = req.nextUrl.searchParams.get("id");

  if (!mentorEmail && !studentEmail)
    return NextResponse.json({ error: "mentor_email or student_email required" }, { status: 400 });

  // Auto-expire stale requests first
  await supabaseServer
    .from("live_requests")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());

  let query = supabaseServer.from("live_requests").select("*");

  if (mentorEmail) {
    query = query.eq("mentor_email", mentorEmail).eq("status", "pending").neq("type", "session-end");
  } else if (studentEmail && id) {
    query = query.eq("student_email", studentEmail).eq("id", id);
  } else if (studentEmail) {
    query = query.eq("student_email", studentEmail).in("status", ["pending", "accepted"]);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/live-requests — student creates a live request
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });
  if (!body.student_email) return NextResponse.json({ error: "student_email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("live_requests")
    .insert([{
      student_email: body.student_email,
      student_name: body.student_name ?? "Student",
      student_image: body.student_image ?? null,
      mentor_email: body.mentor_email,
      type: body.type ?? "chat",
      topic: body.topic ?? "Mentoring",
      rate: body.rate ?? 5,
      status: body.status ?? "pending",
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/live-requests?id=x — mentor accepts/declines
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("live_requests")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
