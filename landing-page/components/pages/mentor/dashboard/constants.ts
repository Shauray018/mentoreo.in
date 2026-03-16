import type React from "react";
import {
  Home,
  MessageCircle,
  Rocket,
  User,
} from "lucide-react";

export type TabId = "home" | "messages" | "boost" | "profile";

export const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "boost", label: "Boost", icon: Rocket },
  { id: "profile", label: "Profile", icon: User },
];

export const EXPERTISE_OPTIONS = [
  "JEE/NEET Preparation",
  "Campus Life & Culture",
  "Placements & Internships",
  "Career Guidance",
  "Branch Selection",
  "College vs College Comparison",
  "Hostel Life",
  "Academics & CGPA",
  "Extracurriculars",
  "Research & Publications",
  "Higher Studies (MS/MBA)",
  "Interview Preparation",
];

export const AVAILABILITY_SLOTS = [
  { day: "Monday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Tuesday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Wednesday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Thursday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Friday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Saturday", slots: ["10 AM–12 PM", "2–4 PM", "6–8 PM"] },
  { day: "Sunday", slots: ["10 AM–12 PM", "2–4 PM", "6–8 PM"] },
];
