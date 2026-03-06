import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/earnings?mentor_email=x
export async function GET(req: NextRequest) {
  const mentor_email = req.nextUrl.searchParams.get("mentor_email");
  if (!mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("earnings")
    .select("*")
    .eq("mentor_email", mentor_email)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/earnings — add earning entry
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mentor_email, amount, month } = body;

  if (!mentor_email || !amount || !month)
    return NextResponse.json({ error: "mentor_email, amount, month required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("earnings")
    .insert([{ mentor_email, amount, month }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}