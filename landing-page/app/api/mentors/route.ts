import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data: signups, error: signupsError } = await supabaseServer
    .from("signups")
    .select("email, name, college, course, branch");

  if (signupsError) {
    return NextResponse.json({ error: signupsError.message }, { status: 500 });
  }

  const emails = (signups ?? []).map((s) => s.email).filter(Boolean);
  if (emails.length === 0) return NextResponse.json([]);

  const { data: profiles } = await supabaseServer
    .from("mentor_profiles")
    .select("email, display_name, bio, approach, upi_id, availability,linkedin,avatar_url, college, course, year, is_available, is_verified")
    .in("email", emails);

  const { data: reviews } = await supabaseServer
    .from("reviews")
    .select("mentor_email, rating")
    .in("mentor_email", emails);

  const reviewsByMentor = new Map<string, { count: number; total: number }>();
  (reviews ?? []).forEach((r) => {
    const key = r.mentor_email as string;
    const current = reviewsByMentor.get(key) ?? { count: 0, total: 0 };
    reviewsByMentor.set(key, { count: current.count + 1, total: current.total + (r.rating ?? 0) });
  });

  const signupByEmail = new Map((signups ?? []).map((s) => [s.email as string, s]));
  const profileByEmail = new Map((profiles ?? []).map((p) => [p.email as string, p]));

  const mentors = (signups ?? []).map((signup) => {
    const profile = profileByEmail.get(signup.email);
    const reviewAgg = reviewsByMentor.get(signup.email) ?? { count: 0, total: 0 };
    const average = reviewAgg.count > 0 ? Number((reviewAgg.total / reviewAgg.count).toFixed(1)) : null;

    const tags: string[] = [];
    if (profile?.course ?? signup.course) tags.push(profile?.course ?? signup.course);
    if (signup?.branch) tags.push(signup.branch);
    if (profile?.year) tags.push(profile.year);

    const completionFields = [
      profile?.display_name,
      profile?.bio,
      profile?.approach,
      profile?.upi_id,
      profile?.linkedin,
      profile?.year,
      profile?.college ?? signup?.college,
      profile?.course ?? signup?.course,
      profile?.avatar_url,
      profile?.availability && Object.keys(profile.availability).length > 0 ? "availability" : null,
    ];
    const completionCount = completionFields.filter(Boolean).length;
    const completionScore = Math.round((completionCount / completionFields.length) * 100);

    return {
      id: signup.email,
      name: profile?.display_name ?? signup?.name ?? signup.email,
      college: profile?.college ?? signup?.college ?? "",
      course: profile?.course ?? signup?.course ?? "",
      image: profile?.avatar_url ?? null,
      rating: average,
      reviews: reviewAgg.count,
      pricePerMin: 5,
      tags,
      is_available: profile?.is_available ?? false,
      is_verified: profile?.is_verified ?? false,
      exam: null,
      collegeType: null,
      availability: profile?.availability ?? null,
      completion: completionScore,
    };
  });

  mentors.sort((a, b) => (b.completion ?? 0) - (a.completion ?? 0));
  return NextResponse.json(mentors);
}
