import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const email = formData.get("email") as string | null;

  if (!file || !email) {
    return NextResponse.json({ error: "file and email required" }, { status: 400 });
  }

  if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or PDF allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const path = `${email}/college-id.${ext}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("mentor-ids")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseServer.storage.from("mentor-ids").getPublicUrl(path);

  const { error: saveError } = await supabaseServer
    .from("mentor_profiles")
    .upsert(
      {
        email,
        college_id_url: data.publicUrl,
        verification_requested_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
