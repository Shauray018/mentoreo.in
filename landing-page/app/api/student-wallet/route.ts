import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/student-wallet?email=x
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("student_wallets")
    .select("*")
    .eq("student_email", email)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// POST /api/student-wallet — create wallet row if missing
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("student_wallets")
    .insert([{ student_email: email }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
