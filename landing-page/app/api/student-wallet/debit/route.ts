import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// POST /api/student-wallet/debit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_email, amount_paise, reference_id, metadata } = body;

    if (!student_email || !amount_paise) {
      return NextResponse.json({ error: "student_email and amount_paise required" }, { status: 400 });
    }

    const { data: wallet } = await supabaseServer
      .from("student_wallets")
      .select("balance_paise")
      .eq("student_email", student_email)
      .single();

    const balance = wallet?.balance_paise ?? 0;
    if (balance < amount_paise) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 402 });
    }

    const { data: tx, error: txError } = await supabaseServer
      .from("student_wallet_transactions")
      .insert([
        {
          student_email,
          type: "debit",
          source: "chat",
          amount_paise,
          reference_id,
          metadata,
        },
      ])
      .select()
      .single();

    if (txError) {
      if (txError.code === "23505") {
        return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
      }
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    const { error: walletErr } = await supabaseServer.rpc("increment_student_wallet", {
      p_email: student_email,
      p_amount: -Math.abs(amount_paise),
    });

    if (walletErr) {
      return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tx }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
