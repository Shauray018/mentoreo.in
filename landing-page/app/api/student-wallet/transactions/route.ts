import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/student-wallet/transactions?email=x
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("student_wallet_transactions")
    .select("*")
    .eq("student_email", email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/student-wallet/transactions — add transaction (server-side)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { student_email, amount_paise, type, source, reference_id, metadata } = body;

  if (!student_email || !amount_paise || !type) {
    return NextResponse.json({ error: "student_email, amount_paise, type required" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("student_wallet_transactions")
    .insert([{ student_email, amount_paise, type, source, reference_id, metadata }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
