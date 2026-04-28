"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
// GET /mentors
router.get("/", async (_req, res) => {
    const { data, error } = await supabase_1.supabase
        .from("mentor_profiles")
        .select(`
      email,
      display_name,
      bio,
      approach,
      tier,
      rate_per_minute,
      is_available,
      expertise_tags,
      college,
      course,
      year,
      avatar_url,
      signups!inner (
        id,
        name
      )
    `)
        .eq("is_available", true)
        .order("tier", { ascending: false });
    if (error) {
        res.status(500).json({ error: "Failed to fetch mentors" });
        return;
    }
    // Flatten for easier consumption on the app side
    const mentors = (data ?? []).map((m) => ({
        email: m.email,
        sendbirdUserId: m.signups.id, // signups UUID = Sendbird user ID
        name: m.signups.name,
        displayName: m.display_name,
        bio: m.bio,
        approach: m.approach,
        tier: m.tier,
        ratePerMinutePaise: m.rate_per_minute * 100, // convert to paise for consistency
        ratePerMinuteRupees: m.rate_per_minute,
        isAvailable: m.is_available,
        expertiseTags: m.expertise_tags,
        college: m.college,
        course: m.course,
        year: m.year,
        avatarUrl: m.avatar_url,
    }));
    res.json({ mentors });
});
// GET /mentors/:email — use encodeURIComponent on client side
router.get("/:email", async (req, res) => {
    const email = decodeURIComponent(req.params.email);
    // Main mentor query without reviews
    const { data, error } = await supabase_1.supabase
        .from("mentor_profiles")
        .select(`
      email,
      display_name,
      bio,
      approach,
      tier,
      rate_per_minute,
      is_available,
      expertise_tags,
      college,
      course,
      year,
      avatar_url,
      linkedin,
      signups!inner (
        id,
        name
      )
    `)
        .eq("email", email)
        .single();
    if (error || !data) {
        console.error("Mentor fetch error:", error);
        res.status(404).json({ error: "Mentor not found" });
        return;
    }
    // Fetch reviews separately via signups.email FK
    const { data: reviews } = await supabase_1.supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("mentor_email", email)
        .order("created_at", { ascending: false });
    const mentor = {
        email: data.email,
        sendbirdUserId: data.signups.id,
        name: data.signups.name,
        displayName: data.display_name,
        bio: data.bio,
        approach: data.approach,
        tier: data.tier,
        ratePerMinutePaise: data.rate_per_minute * 100,
        ratePerMinuteRupees: data.rate_per_minute,
        isAvailable: data.is_available,
        expertiseTags: data.expertise_tags,
        college: data.college,
        course: data.course,
        year: data.year,
        avatarUrl: data.avatar_url,
        linkedin: data.linkedin,
        reviews: reviews ?? [],
    };
    res.json({ mentor });
});
// PATCH /mentors/:email
router.patch("/:email", async (req, res) => {
    const email = decodeURIComponent(req.params.email);
    const { display_name, bio, approach, linkedin, year, college, course, avatar_url, expertise_tags, rate_per_minute, is_available, } = req.body;
    const { data, error } = await supabase_1.supabase
        .from("mentor_profiles")
        .update({
        display_name,
        bio,
        approach,
        linkedin,
        year,
        college,
        course,
        avatar_url,
        expertise_tags,
        rate_per_minute,
        is_available,
        updated_at: new Date().toISOString(),
    })
        .eq("email", email)
        .select()
        .single();
    if (error) {
        return res.status(500).json({ error: "Failed to update mentor profile" });
    }
    res.json({ mentor: data });
});
exports.default = router;
