import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/mentor-profiles?email=x
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("mentor_profiles")
    .select("*")
    .eq("email", email)
    .single();

  // No profile yet is not an error — return null so client can seed defaults
  if (error && error.code === "PGRST116") return NextResponse.json(null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/mentor-profiles — create profile
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("mentor_profiles")
    .insert([body])
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Profile already exists, use PATCH" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/mentor-profiles?email=x — upsert profile
export async function PATCH(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("mentor_profiles")
    .upsert({ ...body, email, updated_at: new Date().toISOString() }, { onConflict: "email" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}