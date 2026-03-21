import { NextRequest, NextResponse } from "next/server";
import { buildCometUid } from "@/lib/cometchat-uid";

function getConfig() {
  const appId = process.env.COMET_APP_ID;
  const region = process.env.COMET_REGION;
  const apiKey = process.env.COMET_REST_API_KEY;
  if (!appId || !region || !apiKey) {
    throw new Error("Missing COMET_APP_ID, COMET_REGION, or COMET_REST_API_KEY");
  }
  return { appId, region, apiKey };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    const name = String(body?.name || "").trim() || "User";
    const avatar = body?.avatar ? String(body.avatar) : null;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const uid = buildCometUid(email);
    const { appId, region, apiKey } = getConfig();

    const res = await fetch(`https://${appId}.api-${region}.cometchat.io/v3/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        uid,
        name,
        avatar: avatar || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // If user exists, treat as success.
      if (err?.error?.code === "ERR_UID_ALREADY_EXISTS") {
        return NextResponse.json({ uid });
      }
      return NextResponse.json({ error: err?.message || "Failed to create user" }, { status: res.status });
    }

    return NextResponse.json({ uid });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
