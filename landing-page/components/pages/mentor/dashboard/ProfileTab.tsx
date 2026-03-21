"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { signOut } from "next-auth/react";
import {
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  IndianRupee,
  ExternalLink,
  MessageSquare,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  Star,
  User,
  Award,
  Building2,
  Shield,
  Video,
  Wallet,
  LogOut,
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
  const [profileCompletionExpanded, setProfileCompletionExpanded] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

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

  useEffect(() => {
    setDisplayName(profile?.display_name ?? signupName ?? "");
    setCollege(profile?.college ?? signupCollege ?? "");
    setCourse(profile?.course ?? signupCourse ?? "");
    setYear(profile?.year ?? "4th Year");
    setBio(profile?.bio ?? "");
    setApproach(profile?.approach ?? "");
    setUpiId(profile?.upi_id ?? "");
    setLinkedIn(profile?.linkedin ?? "");
    setSelectedExpertise(profile?.expertise_tags ?? []);
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
  const profileAvatarUrl = profile?.avatar_url ?? "";
  const profileAvatarUpdatedAt = profile?.updated_at ?? "";
  const withCacheBust = (url: string, stamp?: string) => {
    if (!url) return "";
    const separator = url.includes("?") ? "&" : "?";
    const token = stamp ? encodeURIComponent(stamp) : Date.now().toString();
    return `${url}${separator}v=${token}`;
  };
  const displayAvatarUrl = avatarPreviewUrl || (profileAvatarUrl ? withCacheBust(profileAvatarUrl, profileAvatarUpdatedAt) : "");

  useEffect(() => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === "photo") return { ...task, completed: Boolean(displayAvatarUrl) };
        if (task.id === "bio") return { ...task, completed: Boolean(bio.trim()) };
        if (task.id === "expertise") return { ...task, completed: selectedExpertise.length > 0 };
        if (task.id === "availability") return { ...task, completed: activeSlotCount > 0 };
        if (task.id === "upi") return { ...task, completed: Boolean(upiId.trim()) };
        return task;
      })
    );
  }, [activeSlotCount, bio, displayAvatarUrl, selectedExpertise.length, upiId]);

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
      expertise_tags: selectedExpertise,
      availability: activeSlots,
    });
    setIsProfileEditing(false);
    toast.success("Profile saved");
  };

  const handleAvailabilitySave = async () => {
    await onSaveProfile({ availability: activeSlots });
  };

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const email = profile?.email ?? signupEmail;
    if (!email) return;

    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      if (data?.url) {
        setAvatarPreviewUrl(withCacheBust(data.url));
        await onSaveProfile({ avatar_url: data.url });
      }
    } catch {
      setAvatarPreviewUrl(profileAvatarUrl);
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const renderProfileMenu = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-0 shadow-sm relative pt-6">
        <CardContent className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-2">
            <div className="relative group">
              <button
                onClick={() => !profileComplete && setProfileCompletionExpanded(!profileCompletionExpanded)}
                className="relative focus:outline-none flex items-center justify-center w-[110px] h-[110px]"
              >
                {!profileComplete && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="56" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle
                      cx="60"
                      cy="60"
                      r="56"
                      fill="none"
                      stroke="#FF7A1F"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                      className="transition-all duration-700 drop-shadow-sm"
                    />
                  </svg>
                )}

                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl relative z-10 overflow-hidden shadow-inner border-[3px] border-white text-orange-700" style={{ fontWeight: 700 }}>
                  {displayAvatarUrl ? (
                    <img src={displayAvatarUrl} alt={displayName || signupName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(displayName || signupName)
                  )}
                  {!profileComplete && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] transition-all group-hover:bg-black/50">
                      <span className="text-white text-xl drop-shadow-md" style={{ fontWeight: 700 }}>{progress}%</span>
                    </div>
                  )}
                </div>

                {profileComplete && (
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1.5 shadow-lg z-20 border-2 border-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            <div>
              <h2 className="text-2xl text-gray-900" style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 600 }}>{displayName || signupName}</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1" style={{ fontWeight: 500 }}>
                <MapPin className="h-3.5 w-3.5" /> {college || signupCollege}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {profileCompletionExpanded && !profileComplete && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Complete Your Profile</h3>
                    <button
                      onClick={() => setProfileCompletionExpanded(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Complete all tasks to verify your profile and start getting bookings from students.
                  </p>
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const Icon = task.icon;
                      return (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            task.completed
                              ? "bg-green-50 border-green-200"
                              : "bg-orange-50/50 border-orange-200 hover:border-[#FF7A1F] cursor-pointer"
                          }`}
                          onClick={() => !task.completed && setActiveProfileTab("details")}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            task.completed ? "bg-green-500" : "bg-orange-100"
                          }`}>
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <Icon className="w-4 h-4 text-[#FF7A1F]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{task.label}</h4>
                            <p className="text-xs text-gray-600">{task.description}</p>
                          </div>
                          {!task.completed && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
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
                </div>
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
      <div className="pt-2 md:hidden">
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
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
          <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full mt-6 h-11" onClick={handleAvailabilitySave}>
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
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl overflow-hidden text-orange-700" style={{ fontWeight: 700 }}>
                  {displayAvatarUrl ? (
                    <img src={displayAvatarUrl} alt={displayName || signupName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(displayName || signupName)
                  )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarPick}
                    className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity ${isProfileEditing ? "bg-black/40 opacity-0 group-hover:opacity-100" : "bg-black/20 opacity-0 group-hover:opacity-100"}`}
                    aria-label="Change profile photo"
                  >
                    {avatarUploading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white/70 border-t-white animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
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
                  <Award className="h-4 w-4 text-[#FF7A1F]" /> Expertise Areas
                  <span className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>({selectedExpertise.length} selected)</span>
                </div>
                {tasks.find((t) => t.id === "expertise")?.completed && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Complete
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {EXPERTISE_OPTIONS.map((tag) => {
                  const isSelected = selectedExpertise.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => isProfileEditing && toggleExpertise(tag)}
                      disabled={!isProfileEditing}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${isSelected ? "bg-[#FF7A1F] text-white" : isProfileEditing ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "bg-gray-100 text-gray-400"}`}
                      style={{ fontWeight: isSelected ? 600 : 400 }}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 inline mr-1 -mt-0.5" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-[#FF7A1F]" /> Payments & Availability
                </div>
                <div className="flex items-center gap-2">
                  {tasks.find((t) => t.id === "upi")?.completed && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> UPI
                    </Badge>
                  )}
                  {tasks.find((t) => t.id === "availability")?.completed && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Availability
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">UPI ID</Label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={!isProfileEditing}
                  className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] text-gray-400">Availability</Label>
                  {activeSlotCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7 px-2 text-gray-500 hover:text-red-500 hover:border-red-300"
                      onClick={clearAllSlots}
                      disabled={!isProfileEditing}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {AVAILABILITY_SLOTS.map(({ day, slots }) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-20 text-[11px] text-gray-500 flex-shrink-0">{day}</span>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const key = `${day}-${slot}`;
                          const isActive = activeSlots[key];
                          return (
                            <button
                              key={key}
                              onClick={() => isProfileEditing && toggleSlot(key)}
                              disabled={!isProfileEditing}
                              className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all ${
                                isActive
                                  ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F]"
                                  : isProfileEditing
                                  ? "border-gray-200 text-gray-500 hover:border-gray-300"
                                  : "border-gray-200 text-gray-400"
                              }`}
                              style={{ fontWeight: isActive ? 600 : 400 }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400" style={{ fontWeight: 600 }}>LIVE PREVIEW</p>
              <Button variant="outline" size="sm" className="gap-1 text-[10px] h-7">
                <ExternalLink className="h-3 w-3" />View Public
              </Button>
            </div>

            <div className="relative mx-auto w-full max-w-[320px] bg-[#FFF9F5] border-[6px] border-gray-900 rounded-[2.5rem] shadow-xl overflow-hidden h-[600px] flex flex-col font-nunito">
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-1/2 mx-auto z-50"></div>

              <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 relative">
                <div className="relative h-48 w-full bg-gradient-to-b from-[#FF7A1F] to-amber-500 rounded-b-[32px] overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center -mt-6">
                  {displayAvatarUrl ? (
                    <img src={displayAvatarUrl} alt={displayName || signupName} className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white/60" />
                  ) : (
                    <span className="text-6xl drop-shadow-lg">{getInitials(displayName || signupName)}</span>
                  )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {profileComplete && (
                        <span className="bg-green-500 text-white text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Building2 className="w-2.5 h-2.5" /> Public
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      {displayName || signupName}
                    </h1>
                    <p className="text-white/90 text-[11px] font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {college || signupCollege}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-[#111827] text-sm">{stats.averageRating}</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280] font-semibold">Rating</p>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Video className="w-4 h-4 text-[#FF7A1F]" />
                      <span className="font-bold text-[#111827] text-sm">{stats.totalSessions}</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280] font-semibold">Sessions</p>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-[#111827] text-sm">&lt; 2h</span>
                    </div>
                    <p className="text-[9px] text-[#6B7280] font-semibold">Response</p>
                  </div>
                </div>

                <div className="px-4 py-5 space-y-6 bg-white">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] mb-2.5" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      Academic Profile
                    </h3>
                    <div className="bg-[#FFF9F5] rounded-xl p-3 border border-orange-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[#6B7280] text-[11px]">Course</span>
                        <span className="text-[#111827] font-bold text-[11px] text-right ml-2">{course || signupCourse}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-orange-100">
                        <span className="text-[#6B7280] text-[11px]">Year</span>
                        <span className="text-[#111827] font-bold text-[11px]">{year || "Not set"}</span>
                      </div>
                    </div>
                  </div>

                  {(bio || approach) && (
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>
                        About Me
                      </h3>
                      <p className="text-[#4B5563] text-[11px] leading-relaxed">
                        {bio || approach}
                      </p>
                    </div>
                  )}

                  {selectedExpertise.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>
                        I can help you with
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedExpertise.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-white border border-orange-100 text-[#FF7A1F] px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-b-[2.5rem]">
                <div>
                  <p className="text-[8px] font-semibold text-[#6B7280] uppercase tracking-wider mb-0.5">Session Price</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-black text-[#111827]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      ₹9
                    </span>
                    <span className="text-[10px] font-bold text-[#6B7280]">/min</span>
                  </div>
                </div>

                <Button className="bg-[#FF7A1F] hover:bg-[#E66A15] text-white px-5 py-4 rounded-xl shadow-lg shadow-orange-200 font-bold text-xs flex items-center gap-1.5 h-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  Book
                </Button>
              </div>
            </div>
          </div>
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
        <div className="pt-2 md:hidden">
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
      </AnimatePresence>

      
    </div>
  );
}
