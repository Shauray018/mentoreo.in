"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  IndianRupee,
  MessageSquare,
  Pencil,
  Save,
  Sparkles,
  Star,
  User,
  Wallet,
  X,
} from "lucide-react";
import { AVAILABILITY_SLOTS, EXPERTISE_OPTIONS } from "./constants";
import type { MentorProfile, Review, Session, EarningRow } from "@/store/mentorStore";

interface ProfileTask {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

const initialTasks: ProfileTask[] = [
  { id: "photo", label: "Upload profile photo", description: "Students are 3× more likely to book mentors with photos.", icon: Camera, completed: false },
  { id: "bio", label: "Write your bio", description: "Tell students about yourself in 2-3 lines. Be real, not robotic!", icon: Sparkles, completed: false },
  { id: "expertise", label: "Add expertise tags", description: "Select topics you can help students with.", icon: GraduationCap, completed: false },
  { id: "availability", label: "Set your availability", description: "Choose time slots when students can reach you.", icon: Clock, completed: false },
  { id: "upi", label: "Add UPI / payment info", description: "So we can pay you weekly. Fast and hassle-free.", icon: IndianRupee, completed: false },
];

const defaultReviews = [
  { id: "1", student_name: "Aarav M.", rating: 5, created_at: "2026-02-20", review_text: "Super helpful! Priya gave me real insights about placements that I couldn't find anywhere else.", topic: "Campus Life & Placements" },
  { id: "2", student_name: "Divya K.", rating: 5, created_at: "2026-02-18", review_text: "Honest advice about the pros and cons of IIT Delhi. She didn't sugarcoat anything.", topic: "College Comparison" },
  { id: "3", student_name: "Neha T.", rating: 4, created_at: "2026-02-14", review_text: "Great conversation about branch selection. She helped me think through trade-offs I hadn't considered.", topic: "Branch Selection" },
];

const defaultEarnings = [
  { month: "Oct", amount: 1200 },
  { month: "Nov", amount: 2800 },
  { month: "Dec", amount: 3600 },
  { month: "Jan", amount: 4200 },
  { month: "Feb", amount: 8250 },
  { month: "Mar", amount: 2340 },
];

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}

function formatDate(date?: string) {
  if (!date) return "TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ProfileTabProps {
  signupName: string;
  signupEmail: string;
  signupCollege: string;
  signupCourse: string;
  profile: MentorProfile | null;
  earnings: EarningRow[];
  reviews: Review[];
  sessions: Session[];
  onSaveProfile: (patch: Partial<MentorProfile>) => Promise<void>;
}

export default function ProfileTab({
  signupName,
  signupEmail,
  signupCollege,
  signupCourse,
  profile,
  earnings,
  reviews,
  sessions,
  onSaveProfile,
}: ProfileTabProps) {
  const [activeProfileTab, setActiveProfileTab] = useState<"menu" | "details" | "schedule" | "earnings" | "reviews">("menu");
  const [tasks, setTasks] = useState<ProfileTask[]>(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [profileCompletionExpanded, setProfileCompletionExpanded] = useState(false);

  const [bio, setBio] = useState("");
  const [approach, setApproach] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [upiId, setUpiId] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("4th Year");
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>({});
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? signupName ?? "");
    setCollege(profile?.college ?? signupCollege ?? "");
    setCourse(profile?.course ?? signupCourse ?? "");
    setYear(profile?.year ?? "4th Year");
    setBio(profile?.bio ?? "");
    setApproach(profile?.approach ?? "");
    setUpiId(profile?.upi_id ?? "");
    setLinkedIn(profile?.linkedin ?? "");
    setActiveSlots(profile?.availability ?? {});
  }, [profile, signupName, signupCollege, signupCourse]);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "upcoming").map((s) => ({
      id: s.id,
      student: { name: s.student_name, image: s.student_image ?? "/someGuy.png" },
      date: formatDate(s.scheduled_date),
      time: s.scheduled_time || "TBD",
      duration: `${s.duration_minutes} min`,
      earning: s.earning,
      topic: s.topic,
    })),
    [sessions]
  );

  const pastSessions = useMemo(
    () => sessions.filter((s) => s.status === "completed").map((s) => ({
      id: s.id,
      student: { name: s.student_name, image: s.student_image ?? "/someGuy.png" },
      date: formatDate(s.scheduled_date),
      duration: `${s.duration_minutes} min`,
      earning: s.earning,
      topic: s.topic,
      status: s.status,
    })),
    [sessions]
  );

  const reviewsToShow = reviews.length ? reviews : defaultReviews.map((r) => ({
    id: r.id,
    mentor_email: signupEmail,
    student_name: r.student_name,
    rating: r.rating,
    review_text: r.review_text,
    topic: r.topic,
    created_at: r.created_at,
  }));

  const monthlyEarnings = earnings.length
    ? earnings.map((e) => ({ month: e.month, amount: e.amount }))
    : defaultEarnings;

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const currentMonth = new Date().toLocaleString("default", { month: "short", year: "numeric" });
  const pendingPayout = earnings
    .filter((e) => e.month === currentMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  const stats = {
    totalEarnings: totalEarnings || 12450,
    pendingPayout: pendingPayout || 2340,
    totalSessions: sessions.length || 127,
    averageRating: reviewsToShow.length ? (reviewsToShow.reduce((sum, r) => sum + r.rating, 0) / reviewsToShow.length).toFixed(1) : "4.9",
    thisWeekSessions: Math.min(sessions.length, 8),
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const profileComplete = progress === 100;
  const activeSlotCount = Object.values(activeSlots).filter(Boolean).length;

  const completeTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));
    setActiveTaskId(null);
  };

  const toggleExpertise = (tag: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSlot = (key: string) => {
    setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllSlots = () => setActiveSlots({});

  const handleProfileSave = async () => {
    await onSaveProfile({
      display_name: displayName,
      bio,
      approach,
      upi_id: upiId,
      linkedin: linkedIn,
      year,
      college,
      course,
      availability: activeSlots,
    });
    setSaved(true);
    setIsProfileEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderTaskPanel = (taskId: string) => {
    switch (taskId) {
      case "photo":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-[#FF7A1F] transition-colors cursor-pointer">
              <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5 MB</p>
            </div>
            <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full" onClick={() => completeTask("photo")}>Save Photo</Button>
          </div>
        );
      case "bio":
        return (
          <div className="space-y-4">
            <Textarea placeholder="Hey! I'm a 3rd year CS student at IIT Delhi…" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-32" />
            <p className="text-xs text-gray-500">Be honest and relatable. Students want real talk, not a resume!</p>
            <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full" onClick={() => completeTask("bio")}>Save Bio</Button>
          </div>
        );
      case "expertise":
        return (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-2">
              {EXPERTISE_OPTIONS.map((tag) => (
                <div key={tag} onClick={() => toggleExpertise(tag)} className={`p-3 border rounded-xl cursor-pointer transition-all text-sm ${selectedExpertise.includes(tag) ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F]" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                  <div className="flex items-center gap-2">
                    {selectedExpertise.includes(tag) && <CheckCircle2 className="h-4 w-4 text-[#FF7A1F]" />}
                    <span>{tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full" onClick={() => completeTask("expertise")}>Save Expertise ({selectedExpertise.length} selected)</Button>
          </div>
        );
      case "availability":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Pick time slots when students can reach you.</p>
            <div className="space-y-2">
              {AVAILABILITY_SLOTS.map(({ day, slots }) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-600 flex-shrink-0" style={{ fontWeight: 500 }}>{day.slice(0, 3)}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {slots.map((slot) => {
                      const key = `${day}-${slot}`;
                      return (
                        <button key={key} onClick={() => toggleSlot(key)} className={`px-2.5 py-1.5 rounded-lg text-xs border transition-all ${activeSlots[key] ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`} style={{ fontWeight: activeSlots[key] ? 600 : 400 }}>{slot}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] flex-1" onClick={() => completeTask("availability")}>Save Availability{activeSlotCount > 0 && ` (${activeSlotCount})`}</Button>
              {activeSlotCount > 0 && (
                <Button variant="outline" className="text-gray-500 hover:text-red-500 hover:border-red-300" onClick={clearAllSlots}><X className="h-4 w-4 mr-1" />Clear</Button>
              )}
            </div>
          </div>
        );
      case "upi":
        return (
          <div className="space-y-4">
            <div>
              <Label>UPI ID</Label>
              <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">We'll send weekly payouts to this UPI ID.</p>
            </div>
            <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full" onClick={() => completeTask("upi")}>Save Payment Info</Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderProfileMenu = () => (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
              {getInitials(displayName || signupName)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{displayName || signupName}</h2>
              <p className="text-sm text-gray-500">{signupEmail}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Profile {progress}% Complete</Badge>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setProfileCompletionExpanded((prev) => !prev)}>
              {profileCompletionExpanded ? "Hide tasks" : "View tasks"}
            </Button>
          </div>

          <AnimatePresence>
            {profileCompletionExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  {tasks.map((task) => {
                    const Icon = task.icon;
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${task.completed ? "border-green-200 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}
                        onClick={() => setActiveTaskId(task.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.completed ? "bg-green-100 text-green-600" : "bg-orange-50 text-[#FF7A1F]"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{task.label}</h4>
                            <p className="text-xs text-gray-600">{task.description}</p>
                          </div>
                          {!task.completed && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="w-full mt-4 bg-[#FF7A1F] hover:bg-[#E66A15] text-white"
                  onClick={() => setActiveProfileTab("details")}
                >
                  Complete All Tasks
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { id: "details", label: "Edit Profile", desc: "Update bio, expertise, and preview", icon: User, color: "text-blue-600", bg: "bg-blue-50", hover: "group-hover:bg-blue-500" },
          { id: "schedule", label: "Availability", desc: "Manage your time slots and requests", icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", hover: "group-hover:bg-purple-500" },
          { id: "earnings", label: "Earnings", desc: "Track payouts and session history", icon: Wallet, color: "text-green-600", bg: "bg-green-50", hover: "group-hover:bg-green-500" },
          { id: "reviews", label: "Student Reviews", desc: "Read your feedback and ratings", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", hover: "group-hover:bg-yellow-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveProfileTab(item.id as any)}
              className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.bg} ${item.color} ${item.hover} group-hover:text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 self-center transition-transform group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-[#FF7A1F]" />
              Set Your Availability
              {tasks.find((t) => t.id === "availability")?.completed && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] ml-2">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                </Badge>
              )}
            </CardTitle>
            {activeSlotCount > 0 && (
              <Button variant="outline" size="sm" className="text-xs text-gray-500 hover:text-red-500 hover:border-red-300 gap-1" onClick={clearAllSlots}>
                <X className="h-3.5 w-3.5" /> Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">Select time slots when students can reach you. You have <span className="text-[#FF7A1F]" style={{ fontWeight: 600 }}>{activeSlotCount}</span> active slot{activeSlotCount !== 1 ? "s" : ""}.</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {AVAILABILITY_SLOTS.map(({ day, slots }) => (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <span className="w-24 text-sm text-gray-700 flex-shrink-0" style={{ fontWeight: 600 }}>{day}</span>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const key = `${day}-${slot}`;
                    const isActive = activeSlots[key];
                    return (
                      <button key={key} onClick={() => toggleSlot(key)} className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${isActive ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F] shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`} style={{ fontWeight: isActive ? 600 : 400 }}>
                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full mt-6 h-11" onClick={() => completeTask("availability")}>
            <Save className="h-4 w-4 mr-2" />
            Save Availability
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center"><Calendar className="h-3.5 w-3.5 text-green-600" /></div>
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors">
                <img src={s.student.image} alt={s.student.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ fontWeight: 600 }}>{s.student.name}</p>
                  <p className="text-[11px] text-gray-400">{s.date} · {s.time}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">Confirmed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Clock className="h-3.5 w-3.5 text-gray-500" /></div>
              Past Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {pastSessions.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ fontWeight: 600 }}>{s.student.name}</p>
                  <p className="text-[11px] text-gray-400">{s.date} · {s.duration}</p>
                </div>
                <span className="text-sm text-green-600 flex-shrink-0" style={{ fontWeight: 600 }}>+₹{s.earning}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEarnings = () => {
    const maxAmount = Math.max(...monthlyEarnings.map((e) => e.amount));
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5">
              <p className="text-xs text-green-700 mb-1">Total Earnings</p>
              <p className="text-2xl text-green-900" style={{ fontWeight: 700 }}>₹{Number(stats.totalEarnings).toLocaleString()}</p>
              <p className="text-[11px] text-green-600 mt-1">+32% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-5">
              <p className="text-xs text-orange-700 mb-1">Pending Payout</p>
              <p className="text-2xl text-orange-900" style={{ fontWeight: 700 }}>₹{Number(stats.pendingPayout).toLocaleString()}</p>
              <p className="text-[11px] text-orange-600 mt-1">Payout on March 10, 2026</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">This Week</p>
              <p className="text-2xl" style={{ fontWeight: 700 }}>{stats.thisWeekSessions} sessions</p>
              <p className="text-[11px] text-gray-400 mt-1">₹{(stats.thisWeekSessions * 15 * 12).toLocaleString()} earned</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Earnings</CardTitle>
            <CardDescription>Your earnings trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {monthlyEarnings.map((e) => (
                <div key={e.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-[#FF7A1F]" style={{ fontWeight: 600 }}>₹{(e.amount / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#FF7A1F] to-orange-300 transition-all duration-500" style={{ height: `${(e.amount / maxAmount) * 100}%`, minHeight: 8 }} />
                  <span className="text-[11px] text-gray-500">{e.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Commission Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Platform Fee</span>
                <span className="text-sm" style={{ fontWeight: 700 }}>20%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                <span className="text-sm text-green-700">Your Earnings</span>
                <span className="text-sm text-green-700" style={{ fontWeight: 700 }}>80%</span>
              </div>
              <p className="text-[11px] text-gray-400 px-1">Top performers (50+ sessions/month) get reduced to 15% platform fee</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Request Payout</span>
                {tasks.find((t) => t.id === "upi")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Minimum payout: ₹500</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center py-4">
                <p className="text-3xl text-[#FF7A1F] mb-1" style={{ fontWeight: 700 }}>₹{Number(stats.pendingPayout).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mb-4">Available for withdrawal</p>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-gray-500">UPI ID</Label>
                    <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-1" />
                  </div>
                  <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full">
                    <IndianRupee className="h-4 w-4 mr-1" /> Request Payout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-3xl" style={{ fontWeight: 700 }}>{stats.averageRating}</span>
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-gray-500">Average Rating</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="text-3xl mb-1" style={{ fontWeight: 700 }}>{reviewsToShow.length}</p>
            <p className="text-xs text-gray-500">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="text-3xl mb-1" style={{ fontWeight: 700 }}>{reviewsToShow.filter((r) => r.rating === 5).length}</p>
            <p className="text-xs text-gray-500">5-Star Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = reviewsToShow.filter((r) => r.rating === n).length;
            const pct = reviewsToShow.length > 0 ? (count / reviewsToShow.length) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3">
                <span className="text-sm w-7 text-right text-gray-600" style={{ fontWeight: 500 }}>{n}★</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {reviewsToShow.map((review) => (
            <div key={review.id} className="p-4 rounded-xl border hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm" style={{ fontWeight: 600 }}>{review.student_name}</span>
                  <span className="text-xs text-gray-400 ml-2">· {formatDate(review.created_at)}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-gray-200" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
              <Badge variant="secondary" className="mt-2 text-[10px] bg-gray-100 text-gray-500">{review.topic}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileDetails = () => (
    <div className="space-y-6">
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span style={{ fontWeight: 600 }}>Profile saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base" style={{ fontWeight: 700 }}>Edit Profile</h2>
            {!isProfileEditing ? (
              <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white gap-1.5 text-xs" onClick={() => setIsProfileEditing(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setIsProfileEditing(false)}><X className="h-3.5 w-3.5" />Cancel</Button>
                <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white gap-1.5 text-xs" onClick={handleProfileSave}><Save className="h-3.5 w-3.5" />Save</Button>
              </div>
            )}
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#FF7A1F]" /> Basic Information
                </div>
                {tasks.find((t) => t.id === "photo")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">
                    {getInitials(displayName || signupName)}
                  </div>
                  {isProfileEditing && (
                    <button className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 600 }}>{displayName || signupName}</p>
                  <p className="text-xs text-gray-400">{signupEmail}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label className="text-[11px] text-gray-400 mb-1 block">Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" /></div>
                <div><Label className="text-[11px] text-gray-400 mb-1 block">College</Label><Input value={college} onChange={(e) => setCollege(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" /></div>
                <div><Label className="text-[11px] text-gray-400 mb-1 block">Course / Branch</Label><Input value={course} onChange={(e) => setCourse(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" /></div>
                <div><Label className="text-[11px] text-gray-400 mb-1 block">Year</Label><Input value={year} onChange={(e) => setYear(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" /></div>
              </div>
              <div><Label className="text-[11px] text-gray-400 mb-1 block">LinkedIn (optional)</Label><Input value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/you" disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" /></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FF7A1F]" /> Bio & Approach
                </div>
                {tasks.find((t) => t.id === "bio")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">Your Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={!isProfileEditing} className="min-h-20 text-sm disabled:bg-gray-50 disabled:border-transparent" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{bio.length}/300</p>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">Mentoring Approach</Label>
                <Textarea value={approach} onChange={(e) => setApproach(e.target.value)} disabled={!isProfileEditing} className="min-h-16 text-sm disabled:bg-gray-50 disabled:border-transparent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#FF7A1F]" /> Expertise Tags
                </div>
                {tasks.find((t) => t.id === "expertise")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid sm:grid-cols-2 gap-2">
                {EXPERTISE_OPTIONS.map((tag) => (
                  <div key={tag} onClick={() => isProfileEditing && toggleExpertise(tag)} className={`p-3 border rounded-xl cursor-pointer transition-all text-sm ${selectedExpertise.includes(tag) ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F]" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                    <div className="flex items-center gap-2">
                      {selectedExpertise.includes(tag) && <CheckCircle2 className="h-4 w-4 text-[#FF7A1F]" />}
                      <span>{tag}</span>
                    </div>
                  </div>
                ))}
              </div>
              {isProfileEditing && (
                <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white gap-1.5" onClick={() => completeTask("expertise")}>
                  <Save className="h-3.5 w-3.5" /> Save Expertise
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-[#FF7A1F]" /> Payment Info
                </div>
                {tasks.find((t) => t.id === "upi")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Label className="text-[11px] text-gray-400">UPI ID</Label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#FF7A1F]" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-2">{progress}% completed</p>
              {activeTaskId && (
                <div className="mt-4 p-4 rounded-xl border">
                  {renderTaskPanel(activeTaskId)}
                </div>
              )}
            </CardContent>
          </Card>

          {profileComplete && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Sparkles className="h-5 w-5 text-green-600" /></div>
                <div>
                  <h3 className="text-green-900 text-sm" style={{ fontWeight: 700 }}>Your profile is live! 🎉</h3>
                  <p className="text-xs text-green-700">Students can now find and book sessions with you.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><Calendar className="h-4 w-4 text-green-600" /></div>
                Upcoming Sessions
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">{upcomingSessions.length}</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setActiveProfileTab("schedule"); }}>View All</Button>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="p-3.5 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <img src={session.student.image} alt={session.student.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm" style={{ fontWeight: 600 }}>{session.student.name}</h4>
                        <span className="text-[#FF7A1F] text-sm" style={{ fontWeight: 600 }}>+₹{session.earning}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{session.topic}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{session.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (activeProfileTab === "menu") return renderProfileMenu();

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="gap-2 -ml-3 text-gray-500 hover:text-gray-900" onClick={() => setActiveProfileTab("menu")}>
        <ChevronLeft className="w-4 h-4" /> Back to Profile Menu
      </Button>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProfileTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeProfileTab === "details" && renderProfileDetails()}
          {activeProfileTab === "schedule" && renderSchedule()}
          {activeProfileTab === "earnings" && renderEarnings()}
          {activeProfileTab === "reviews" && renderReviews()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
