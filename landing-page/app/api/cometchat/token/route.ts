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

async function createUser({
  uid,
  name,
  avatar,
}: {
  uid: string;
  name: string;
  avatar?: string | null;
}) {
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
      withAuthToken: true,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function createAuthToken(uid: string) {
  const { appId, region, apiKey } = getConfig();
  const res = await fetch(
    `https://${appId}.api-${region}.cometchat.io/v3/users/${uid}/auth_tokens`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ force: true }),
    }
  );

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
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

    const created = await createUser({ uid, name, avatar });
    if (created.ok && created.data?.data?.authToken) {
      return NextResponse.json({ uid, authToken: created.data.data.authToken });
    }

    const tokenRes = await createAuthToken(uid);
    if (!tokenRes.ok || !tokenRes.data?.data?.authToken) {
      return NextResponse.json(
        { error: tokenRes.data?.message || "Failed to create auth token" },
        { status: tokenRes.status || 500 }
      );
    }

    return NextResponse.json({ uid, authToken: tokenRes.data.data.authToken });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
