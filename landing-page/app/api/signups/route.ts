import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/signups?email=x
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("signups")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// POST /api/signups — create new signup
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, college, course, branch, password } = body;

  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("signups")
    .insert([{ name, phone, email: email?.toLowerCase?.() ?? email, college, course, branch, password }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/signups?email=x — update signup fields
export async function PATCH(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("signups")
    .update(body)
    .eq("email", email)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
