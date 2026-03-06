"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { useMentorStore } from "@/store/mentorStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Camera } from "lucide-react";
import {
  Calendar, Clock, MessageSquare, Star, IndianRupee, Users, Eye,
  CheckCircle2, User, GraduationCap, Sparkles,
  LayoutDashboard, Wallet, MapPin, Pencil, Save, X, Loader2,
} from "lucide-react";

type TabId = "dashboard" | "schedule" | "earnings" | "reviews" | "profile";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "profile", label: "Profile", icon: User },
];

const AVAILABILITY_SLOTS = [
  { day: "Monday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Tuesday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Wednesday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Thursday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Friday", slots: ["9–11 AM", "6–8 PM", "8–10 PM"] },
  { day: "Saturday", slots: ["10 AM–12 PM", "2–4 PM", "6–8 PM"] },
  { day: "Sunday", slots: ["10 AM–12 PM", "2–4 PM", "6–8 PM"] },
];

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function MentorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    signup, profile, sessions, reviews, earnings,
    loading, fetchAll, saveProfile, acceptSession, declineSession, clear,
  } = useMentorStore();

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [requestsPanelOpen, setRequestsPanelOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Local edit state — seeded from store ──
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [approach, setApproach] = useState("");
  const [upiId, setUpiId] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [year, setYear] = useState("Final Year");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>({});
  const [isAvailable, setIsAvailable] = useState(true);

  function AvatarUpload({ name, avatarUrl, email, onUploaded }: {
  name: string;
  avatarUrl: string | null;
  email: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("email", email);

    const res = await fetch("/api/upload-avatar", { method: "POST", body: form });
    const data = await res.json();

    if (data.url) onUploaded(data.url);
    setUploading(false);
  }

  return (
    <label className="relative cursor-pointer group w-14 h-14 flex-shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} className="w-14 h-14 rounded-2xl object-cover" />
      ) : (
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center
                        justify-center text-orange-600 font-bold text-xl">
          {getInitials(name)}
        </div>
      )}
      {isProfileEditing && (
        <>
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center
                          justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <Loader2 className="h-5 w-5 text-white animate-spin" />
              : <Camera className="h-5 w-5 text-white" />
            }
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}
    </label>
  );
}

  // ── Auth guard ──
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/mentor/login");
  }, [status, router]);

  // ── Fetch all data on mount ──
  useEffect(() => {
    if (session?.user?.email) fetchAll(session.user.email);
    return () => clear();
  }, [session?.user?.email]);

  // ── Seed local edit state from store once data loads ──
  useEffect(() => {
    if (!signup) return;

    // Always seed college/course/name from signups table
    setCollege(profile?.college ?? signup.college ?? "");
    setCourse(profile?.course ?? signup.course ?? "");

    // Display name: profile takes priority, fallback to signups name
    setDisplayName(profile?.display_name ?? signup.name ?? "");
    setBio(profile?.bio ?? "");
    setApproach(profile?.approach ?? "");
    setUpiId(profile?.upi_id ?? "");
    setLinkedIn(profile?.linkedin ?? "");
    setYear(profile?.year ?? "Final Year");
    setActiveSlots(profile?.availability ?? {});
    setIsAvailable(profile?.is_available ?? true);
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [signup, profile]);

  // ── Save profile ──
  const handleProfileSave = async () => {
    if (!session?.user?.email) return;
    setProfileSaving(true);
    await saveProfile(session.user.email, {
      display_name: displayName,
      bio,
      approach,
      upi_id: upiId,
      linkedin: linkedIn,
      year,
      college,
      course,
      availability: activeSlots,
      is_available: isAvailable,
    });
    setProfileSaving(false);
    setIsProfileEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleSlot = (key: string) =>
    setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Derived ──
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const requestedSessions = sessions.filter((s) => s.status === "requested");
  const pastSessions = sessions.filter((s) => s.status === "completed");
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const currentMonth = new Date().toLocaleString("default", { month: "short", year: "numeric" });
  const pendingPayout = earnings
    .filter((e) => e.month === currentMonth)
    .reduce((sum, e) => sum + e.amount, 0);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
  const activeSlotCount = Object.values(activeSlots).filter(Boolean).length;
  const mentorName = displayName || signup?.name || session?.user?.name || "Mentor";
  const mentorEmail = session?.user?.email ?? "";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#FF7A1F] animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  // ════════════════════════════════
  //  TAB RENDERERS
  // ════════════════════════════════

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Earnings", value: `₹${(totalEarnings / 1000).toFixed(1)}k`, icon: IndianRupee, bg: "bg-green-50", color: "text-green-600" },
          { label: "Pending", value: `₹${pendingPayout}`, icon: Wallet, bg: "bg-orange-50", color: "text-[#FF7A1F]" },
          { label: "Sessions", value: sessions.length, icon: MessageSquare, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Rating", value: avgRating, icon: Star, bg: "bg-yellow-50", color: "text-yellow-600" },
          { label: "Reviews", value: reviews.length, icon: Eye, bg: "bg-purple-50", color: "text-purple-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold truncate">{s.value}</p>
                  <p className="text-[11px] text-gray-400 truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            Upcoming Sessions
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">{upcomingSessions.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("schedule")}>View All</Button>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming sessions yet.</p>
          ) : upcomingSessions.map((s) => (
            <div key={s.id} className="p-3.5 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3.5">
                <Avatar name={s.student_name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{s.student_name}</h4>
                    <span className="text-[#FF7A1F] text-sm font-semibold">+₹{s.earning}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{s.topic}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.scheduled_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.scheduled_time}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{s.duration_minutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              Recent Reviews
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("reviews")}>View All</Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {reviews.slice(0, 2).map((r) => (
              <div key={r.id} className="p-3.5 border rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{r.student_name}</span>
                  <div className="flex gap-0.5">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{r.review_text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
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
            </CardTitle>
            {activeSlotCount > 0 && (
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setActiveSlots({})}>
                <X className="h-3.5 w-3.5" /> Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            <span className="text-[#FF7A1F] font-semibold">{activeSlotCount}</span> active slot{activeSlotCount !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {AVAILABILITY_SLOTS.map(({ day, slots }) => (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <span className="w-24 text-sm text-gray-700 font-semibold flex-shrink-0">{day}</span>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const key = `${day}-${slot}`;
                    const isActive = activeSlots[key];
                    return (
                      <button key={key} onClick={() => toggleSlot(key)}
                        className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${isActive ? "border-[#FF7A1F] bg-orange-50 text-[#FF7A1F] font-semibold shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}{slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Button className="bg-[#FF7A1F] hover:bg-[#FF6A0F] w-full mt-6 h-11" onClick={handleProfileSave}>
            <Save className="h-4 w-4 mr-2" /> Save Availability
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-green-600" />
              </div>
              Upcoming ({upcomingSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming sessions.</p>
            ) : upcomingSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 transition-colors">
                <Avatar name={s.student_name} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.student_name}</p>
                  <p className="text-[11px] text-gray-400">{s.scheduled_date} · {s.scheduled_time}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">Confirmed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
              </div>
              Past Sessions ({pastSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {pastSessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No completed sessions yet.</p>
            ) : pastSessions.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{s.student_name}</p>
                  <p className="text-[11px] text-gray-400">{s.scheduled_date} · {s.duration_minutes} min</p>
                </div>
                <span className="text-sm text-green-600 font-semibold flex-shrink-0">+₹{s.earning}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEarnings = () => {
    const maxAmount = earnings.length > 0 ? Math.max(...earnings.map((e) => e.amount)) : 1;
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5">
              <p className="text-xs text-green-700 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-900">₹{totalEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-5">
              <p className="text-xs text-orange-700 mb-1">This Month</p>
              <p className="text-2xl font-bold text-orange-900">₹{pendingPayout.toLocaleString()}</p>
              <p className="text-[11px] text-orange-600 mt-1">Payout on 10th</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold">{sessions.length}</p>
            </CardContent>
          </Card>
        </div>

        {earnings.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Earnings</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {earnings.map((e) => (
                  <div key={e.id} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs text-[#FF7A1F] font-semibold">₹{(e.amount / 1000).toFixed(1)}k</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#FF7A1F] to-orange-300"
                      style={{ height: `${(e.amount / maxAmount) * 100}%`, minHeight: 8 }} />
                    <span className="text-[11px] text-gray-500">{e.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Commission Structure</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Platform Fee</span>
                <span className="text-sm font-bold">20%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                <span className="text-sm text-green-700">Your Earnings</span>
                <span className="text-sm text-green-700 font-bold">80%</span>
              </div>
              <p className="text-[11px] text-gray-400 px-1">Top performers (50+ sessions/month) get reduced to 15% platform fee.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Request Payout</CardTitle>
              <CardDescription>Minimum payout: ₹500</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-center py-4">
              <p className="text-3xl text-[#FF7A1F] font-bold mb-1">₹{pendingPayout.toLocaleString()}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Average Rating", value: <div className="flex items-center justify-center gap-1"><span className="text-3xl font-bold">{avgRating}</span><Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /></div> },
          { label: "Total Reviews", value: <p className="text-3xl font-bold">{reviews.length}</p> },
          { label: "5-Star Reviews", value: <p className="text-3xl font-bold">{reviews.filter((r) => r.rating === 5).length}</p> },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              {s.value}
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Rating Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-2 pt-0">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = reviews.filter((r) => r.rating === n).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3">
                <span className="text-sm w-7 text-right text-gray-600 font-medium">{n}★</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-6">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">All Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3 pt-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Complete sessions to get your first review!</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold">{r.student_name}</span>
                  <span className="text-xs text-gray-400 ml-2">· {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}
                  {[...Array(5 - r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-gray-200" />)}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.review_text}</p>
              {r.topic && <Badge variant="secondary" className="mt-2 text-[10px] bg-gray-100 text-gray-500">{r.topic}</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">Profile saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Edit Profile</h2>
            {!isProfileEditing ? (
              <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white gap-1.5 text-xs" onClick={() => setIsProfileEditing(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setIsProfileEditing(false)}><X className="h-3.5 w-3.5" />Cancel</Button>
                <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white gap-1.5 text-xs" onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                </Button>
              </div>
            )}
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[#FF7A1F]" />Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-4 mb-2">
                <AvatarUpload
                    name={mentorName}
                    avatarUrl={avatarUrl}
                    email={mentorEmail}
                    onUploaded={(url) => setAvatarUrl(url)}
                />
                <div>
                    <p className="text-sm font-semibold">{mentorName}</p>
                    <p className="text-xs text-gray-400">{mentorEmail}</p>
                </div>
                </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-gray-400 mb-1 block">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
                </div>
                <div>
                  <Label className="text-[11px] text-gray-400 mb-1 block">College</Label>
                  <Input value={college} onChange={(e) => setCollege(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
                </div>
                <div>
                  <Label className="text-[11px] text-gray-400 mb-1 block">Course</Label>
                  <Input value={course} onChange={(e) => setCourse(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
                </div>
                <div>
                  <Label className="text-[11px] text-gray-400 mb-1 block">Year</Label>
                  <Input value={year} onChange={(e) => setYear(e.target.value)} disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">LinkedIn (optional)</Label>
                <Input value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/you" disabled={!isProfileEditing} className="h-9 text-sm disabled:bg-gray-50 disabled:border-transparent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#FF7A1F]" />Bio & Approach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">Your Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={!isProfileEditing} className="min-h-20 text-sm disabled:bg-gray-50 disabled:border-transparent" placeholder="Tell students about yourself…" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{bio.length}/300</p>
              </div>
              <div>
                <Label className="text-[11px] text-gray-400 mb-1 block">Mentoring Approach</Label>
                <Textarea value={approach} onChange={(e) => setApproach(e.target.value)} disabled={!isProfileEditing} className="min-h-16 text-sm disabled:bg-gray-50 disabled:border-transparent" placeholder="How do you mentor students?" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-4">
            <p className="text-xs text-gray-400 font-semibold">LIVE PREVIEW</p>
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-[#FF7A1F] via-orange-400 to-amber-300" />
              <CardContent className="px-5 pb-5 -mt-8">
                <div className="mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md border-4 border-white overflow-hidden flex items-center justify-center">
                    {avatarUrl
                        ? <img src={avatarUrl} className="w-full h-full object-cover" />
                        : <Avatar name={mentorName} size={48} />
                    }
                    </div>
                </div>
                <h3 className="text-lg font-bold mb-0.5">{displayName || mentorName}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-0.5"><MapPin className="h-3 w-3" />{college}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-3"><GraduationCap className="h-3 w-3" />{course} · {year}</p>
                {bio && <p className="text-xs text-gray-600 mb-3 leading-relaxed">{bio.length > 120 ? bio.slice(0, 120) + "…" : bio}</p>}
                <div className="grid grid-cols-3 gap-2 mb-3 p-2.5 rounded-xl bg-gray-50 text-center">
                  <div><p className="text-sm font-bold">{sessions.length}</p><p className="text-[9px] text-gray-400">Sessions</p></div>
                  <div className="border-x border-gray-200">
                    <p className="text-sm font-bold flex items-center justify-center gap-0.5">{avgRating}<Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /></p>
                    <p className="text-[9px] text-gray-400">Rating</p>
                  </div>
                  <div><p className="text-sm font-bold">{reviews.length}</p><p className="text-[9px] text-gray-400">Reviews</p></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                  <div><p className="text-[10px] text-gray-500">Starting at</p><p className="text-base text-[#FF7A1F] font-bold">₹9<span className="text-xs font-normal">/min</span></p></div>
                  <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white rounded-xl text-xs h-8 px-4"><MessageSquare className="h-3.5 w-3.5 mr-1" />Book</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════
  //  MAIN RENDER
  // ════════════════════════════════
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3.5">
            <Avatar name={mentorName} size={48} />
            <div>
              <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: "Fredoka, sans-serif" }}>Mentor Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {mentorName.split(" ")[0]}! 👋
                <span className="text-gray-300 mx-1.5">·</span>
                <span className="text-gray-400">{college}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border shadow-sm">
              <span className="text-xs text-gray-500">Available</span>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
            <button
              onClick={() => setRequestsPanelOpen(!requestsPanelOpen)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm text-xs font-semibold transition-all ${
                requestsPanelOpen ? "bg-[#FF7A1F] border-[#FF7A1F] text-white"
                  : requestedSessions.length > 0 ? "bg-orange-50 border-orange-200 text-[#FF7A1F] hover:bg-orange-100"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Requests</span>
              {requestedSessions.length > 0 && (
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${requestsPanelOpen ? "bg-white text-[#FF7A1F]" : "bg-[#FF7A1F] text-white"}`}>
                  {requestedSessions.length}
                </span>
              )}
            </button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setActiveTab("profile")}>
              <User className="h-3.5 w-3.5" /><span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>

        {/* Requests Panel */}
        <AnimatePresence>
          {requestsPanelOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mb-4 p-4 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50/80 to-amber-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">Session Requests</h3>
                  <button onClick={() => setRequestsPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400"><X className="h-4 w-4" /></button>
                </div>
                <AnimatePresence mode="popLayout">
                  {requestedSessions.length > 0 ? (
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {requestedSessions.map((req) => (
                        <motion.div key={req.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-3.5 rounded-xl bg-white border border-orange-100 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Avatar name={req.student_name} size={36} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate">{req.student_name}</h4>
                              <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">{req.topic}</p>
                              <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2.5">
                                <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{req.scheduled_date}</span>
                                <span className="text-[#FF7A1F] font-semibold">+₹{req.earning}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white rounded-lg px-3.5 h-7 text-xs flex-1" onClick={() => acceptSession(req.id)}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />Accept
                                </Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500 h-7 text-xs px-2.5" onClick={() => declineSession(req.id)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5 text-gray-400">
                      <CheckCircle2 className="h-7 w-7 mx-auto mb-1.5 opacity-40" />
                      <p className="text-sm">No pending requests.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Bar */}
        <div className="border-b border-gray-200 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-all ${isActive ? "border-[#FF7A1F] text-[#FF7A1F] font-semibold" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "schedule" && renderSchedule()}
            {activeTab === "earnings" && renderEarnings()}
            {activeTab === "reviews" && renderReviews()}
            {activeTab === "profile" && renderProfile()}
          </motion.div>
        </AnimatePresence>
      </div>
  );
}
