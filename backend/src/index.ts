import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth";
import mentorRoutes from "./routes/mentors";
import sessionRoutes from "./routes/sessions";
import walletRoutes from "./routes/wallet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/mentors", mentorRoutes);
app.use("/sessions", sessionRoutes);
app.use("/wallet", walletRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});