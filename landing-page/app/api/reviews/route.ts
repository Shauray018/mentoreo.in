import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET /api/reviews?mentor_email=x
export async function GET(req: NextRequest) {
  const mentor_email = req.nextUrl.searchParams.get("mentor_email");
  if (!mentor_email) return NextResponse.json({ error: "mentor_email required" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("reviews")
    .select("*")
    .eq("mentor_email", mentor_email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/reviews — add review
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { mentor_email, student_name, rating, review_text, topic } = body;

  if (!mentor_email || !student_name || !rating)
    return NextResponse.json({ error: "mentor_email, student_name, rating required" }, { status: 400 });

  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("reviews")
    .insert([{ mentor_email, student_name, rating, review_text, topic }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}