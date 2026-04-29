"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../lib/supabase");
const router = express_1.default.Router();
router.get("/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const { data, error } = await supabase_1.supabase
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
    }
    catch (err) {
        console.error("Student fetch error:", err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
exports.default = router;
