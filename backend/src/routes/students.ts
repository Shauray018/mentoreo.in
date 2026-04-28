import express from "express";
import { supabase } from "../lib/supabase";

const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const { data, error } = await supabase
      .from("student_signups")
      .select("name,email")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    return res.json({
      student: data,
    });
  } catch (err) {
    console.error("Student fetch error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;