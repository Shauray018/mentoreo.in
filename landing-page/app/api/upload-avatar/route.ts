import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const email = formData.get("email") as string;

  if (!file || !email)
    return NextResponse.json({ error: "file and email required" }, { status: 400 });

  // Validate type and size
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const path = `${email}/avatar.${ext}`; // one avatar per mentor, overwrites old

  const { error: uploadError } = await supabaseServer.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Get public URL
  const { data } = supabaseServer.storage.from("avatars").getPublicUrl(path);

  // Save URL to mentor_profiles
  await supabaseServer
    .from("mentor_profiles")
    .upsert({ email, avatar_url: data.publicUrl }, { onConflict: "email" });

  return NextResponse.json({ url: data.publicUrl });
}