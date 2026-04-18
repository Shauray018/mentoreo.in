import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// GET /mentors — browse all available mentors with their profile + rate
router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(`
      id,
      tier,
      rate_per_minute,
      is_available,
      signups (
        id,
        name,
        email,
        college,
        branch
      )
    `)
    .eq("is_available", true)
    .order("tier", { ascending: false });

  if (error) {
    res.status(500).json({ error: "Failed to fetch mentors" });
    return;
  }

  res.json({ mentors: data });
});

// GET /mentors/:mentorId — single mentor detail
router.get("/:mentorId", async (req: Request, res: Response) => {
  const { mentorId } = req.params;

  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(`
      id,
      tier,
      rate_per_minute,
      is_available,
      signups (
        id,
        name,
        email,
        college,
        branch
      ),
      reviews (
        id,
        rating,
        comment,
        created_at
      )
    `)
    .eq("id", mentorId)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Mentor not found" });
    return;
  }

  res.json({ mentor: data });
});

export default router;