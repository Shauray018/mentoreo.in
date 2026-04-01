"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, Sparkles, GraduationCap, Building2, 
  MapPin, SlidersHorizontal, Star, Briefcase, 
  Stethoscope, Palette, Cpu, ChevronRight, BookOpen, Target, FileText, Users,
  Calendar, Zap, Clock, X, CreditCard
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import MentorCardSkeleton from "@/components/skeletons/MentorCardSkeleton";
import { useMentorBrowseStore } from "@/store/mentorBrowseStore";
import { useSession } from "next-auth/react";
import { sendLiveRequest, sendSessionBooking, subscribeLiveResponses, subscribeSessionStatusUpdates, subscribeSessionReady } from "@/services/liveRequests";
import { useStudentStore } from "@/store/studentStore";
import { buildCometUid } from "@/lib/cometchat-uid";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";

const EXAMS = [
  { id: 'JEE', label: 'JEE Main/Adv', icon: Cpu },
  { id: 'NEET', label: 'NEET UG', icon: Stethoscope },
  { id: 'CUET', label: 'CUET', icon: BookOpen },
  { id: 'CAT', label: 'CAT', icon: Briefcase },
  { id: 'NID', label: 'NID DAT', icon: Palette },
  { id: 'CLAT', label: 'CLAT', icon: FileText },
  { id: 'BITSAT', label: 'BITSAT', icon: Target },
  { id: 'UPSC', label: 'UPSC', icon: Users },
  { id: 'GATE', label: 'GATE', icon: Cpu }
];

const GOALS = [
  { id: 'college', label: 'College Selection', icon: Building2, color: 'bg-blue-50 text-blue-600' },
  { id: 'branch', label: 'Branch/Major Choice', icon: Target, color: 'bg-purple-50 text-[#9758FF]' },
  { id: 'strategy', label: 'Exam Strategy', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'drop', label: 'Drop Year Advice', icon: Users, color: 'bg-orange-50 text-orange-600' },
];

export default function StudentHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeExam, setActiveExam] = useState("All");
  const [collegeType, setCollegeType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<"instant" | "schedule">("instant");
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[number] | null>(null);
  const { mentors, loading, error, fetchMentors } = useMentorBrowseStore();
  const { data: session } = useSession();
  const onlineMentors = useOnlineMentors();
  const { sessions: studentSessions, fetchSessions: fetchStudentSessions } = useStudentStore();

  const studentEmail = session?.user?.email ?? "";

  useEffect(() => {
    if (!mentors.length) fetchMentors();
  }, [mentors.length, fetchMentors]);

  // Fetch student sessions on mount
  useEffect(() => {
    if (studentEmail) fetchStudentSessions(studentEmail);
  }, [studentEmail, fetchStudentSessions]);

  // Subscribe to accept/decline and session-ready notifications
  useEffect(() => {
    if (!studentEmail) return;
    const { cleanup: cleanupStatus } = subscribeSessionStatusUpdates(studentEmail, (payload) => {
      fetchStudentSessions(studentEmail);
      if (payload.status === "upcoming") {
        toast.success(`${payload.mentorName} accepted your session request!`, {
          description: `${payload.topic} — ${payload.scheduledDate} at ${payload.scheduledTime}`,
        });
      } else if (payload.status === "declined") {
        toast.error(`${payload.mentorName} declined your session request.`, {
          description: payload.topic,
        });
      }
    });
    const { cleanup: cleanupReady } = subscribeSessionReady(studentEmail, (payload) => {
      const chatUrl = `/student/chats/${buildCometUid(payload.mentorEmail)}`;
      toast.success(`${payload.mentorName} is ready for your session!`, {
        description: payload.topic,
        duration: 10000,
        action: {
          label: "Join Chat",
          onClick: () => router.push(chatUrl),
        },
      });
    });
    return () => {
      cleanupStatus();
      cleanupReady();
    };
  }, [studentEmail, fetchStudentSessions, router]);

  // Upcoming sessions (future only, sorted)
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return studentSessions
      .filter((s) => s.status === "upcoming" || s.status === "requested")
      .filter((s) => {
        if (!s.scheduled_date) return false;
        if (s.scheduled_date > todayStr) return true;
        if (s.scheduled_date < todayStr) return false;
        if (!s.scheduled_time) return true;
        const [h, m] = s.scheduled_time.split(":").map(Number);
        return h * 60 + (m ?? 0) >= nowMinutes;
      })
      .sort((a, b) => {
        const dateComp = a.scheduled_date.localeCompare(b.scheduled_date);
        if (dateComp !== 0) return dateComp;
        return (a.scheduled_time ?? "").localeCompare(b.scheduled_time ?? "");
      });
  }, [studentSessions]);

  useEffect(() => {
    const mentorEmail = searchParams.get("bookMentor");
    const mode = searchParams.get("mode");
    if (!mentorEmail || mentors.length === 0) return;
    const target = mentors.find((m) => m.id === mentorEmail);
    if (!target) return;
    openBooking(target);
    if (mode === "schedule") setBookingMode("schedule");
    router.replace("/student/dashboard");
  }, [searchParams, mentors, router]);

  const name = session?.user?.name ?? "Student";

   const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const filteredMentors = mentors.filter((m) =>
    (activeExam === "All" || !m.exam || m.exam === activeExam) &&
    (collegeType === "All" || !m.collegeType || m.collegeType === collegeType) &&
    (searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.college ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openBooking = (mentor: (typeof mentors)[number]) => {
    const isLive = isMentorLive(mentor.id, mentor.is_available);
    setSelectedMentor(mentor);
    setBookingOpen(true);
    setBookingMode(isLive ? "instant" : "schedule");
    setBookingStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setPreferredTime("");
    setBookingNote("");
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedMentor(null);
    setBookingStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setPreferredTime("");
  };

  const formatTime12 = (time24: string) => {
    const [h, m] = time24.split(":").map(Number);
    const meridiem = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${meridiem}`;
  };

  const getSlotsForDate = (availability: Record<string, boolean> | null | undefined, date: Date | null) => {
    if (!availability || !date) return [];
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const availableDays = getAvailableDays(availability);
    if (!availableDays.has(day)) return [];

    const isToday = date.toDateString() === new Date().toDateString();
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const slots: string[] = [];
    for (let minutes = 12 * 60; minutes < 19 * 60; minutes += 30) {
      if (isToday && minutes <= nowMinutes) continue;
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return slots;
  };

  const getAvailableDays = (availability: Record<string, boolean> | null | undefined) => {
    if (!availability) return new Set<string>();
    const days = new Set<string>();
    Object.entries(availability).forEach(([key, value]) => {
      if (!value) return;
      const day = key.split("-")[0]?.trim();
      if (day) days.add(day);
    });
    return days;
  };

  const availableDays = getAvailableDays(selectedMentor?.availability);
  const availableSlots = getSlotsForDate(selectedMentor?.availability, selectedDate);
  const isDateAvailable = (date: Date) => {
    if (availableDays.size === 0) return false;
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    return availableDays.has(day);
  };

  const isMentorLive = (mentorId?: string | null, mentorAvailable?: boolean | null) =>
    Boolean(mentorAvailable && mentorId && onlineMentors.has(mentorId));

  const createBookingRequest = async () => {
    if (!selectedMentor || !selectedDate || !selectedTime) return;
    if (!session?.user?.email) {
      router.push("/student/login");
      return;
    }

    const scheduledDate = selectedDate.toISOString().split("T")[0];
    const topic = bookingNote.trim() || selectedMentor.course || "Mentoring";

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentor_email: selectedMentor.id,
        student_email: session.user.email,
        student_name: session?.user?.name ?? "Student",
        student_image: session?.user?.image ?? null,
        topic,
        scheduled_date: scheduledDate,
        scheduled_time: selectedTime,
        duration_minutes: 0,
        earning: 0,
        status: "requested",
        requested_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      toast.error("Failed to send booking request.");
      return;
    }

    sendSessionBooking(selectedMentor.id);
    if (studentEmail) fetchStudentSessions(studentEmail);
    toast.success("Booking request sent!");
    closeBooking();
  };


  const handleInstantContinue = () => {
    if (!selectedMentor) return;
    if (!session?.user?.email) {
      router.push("/student/login");
      return;
    }
    if (!isMentorLive(selectedMentor.id, selectedMentor.is_available)) {
      toast.error("Mentor is not live right now.");
      return;
    }
    fetch("/api/cometchat/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: selectedMentor.id,
        name: selectedMentor.name,
        avatar: selectedMentor.avatar_url ?? null,
      }),
    }).catch(() => null);
    sendLiveRequest(selectedMentor.id, {
      id: `${selectedMentor.id}-${Date.now()}`,
      studentEmail: session.user.email,
      studentName: session?.user?.name ?? "Student",
      studentImage: null,
      type: "chat",
      topic: selectedMentor.course ?? "Mentoring",
      rate: selectedMentor.pricePerMin ?? 5,
      createdAt: Date.now(),
    });
    toast.success("Request sent to mentor");
    closeBooking();
  };

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    const { cleanup } = subscribeLiveResponses(email, (payload) => {
      const chatUrl = `/student/chats/${buildCometUid(payload.mentorEmail)}?mentor=${encodeURIComponent(payload.mentorEmail)}&live=1`;
      toast(`${payload.mentorName} joined the chat`, {
        action: {
          label: "Open",
          onClick: () => router.push(chatUrl),
        },
      });
    });
    return () => cleanup();
  }, [session?.user?.email, router]);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24 font-nunito">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-[#F6F2FF] via-[#EFEAFF] to-[#E3DCFF] px-4 pt-10 pb-6 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#9758FF] opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-[#D0B3FF] opacity-10 rounded-full blur-xl"></div>

        <div className="relative z-10 w-full max-w-md md:max-w-6xl mx-auto md:px-8">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <img src="/icon.jpg" alt="Mentoreo" className="w-8 h-8 rounded-lg" />
          </div>

          <header className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <p className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-1 flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> Student Portal
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-[#111827]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Find your ideal <span className="text-[#9758FF]">mentor</span>
              </h2>
            </div>
            <Link href="/student/profile" className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-md border-2 border-[#E9D5FF] flex items-center justify-center p-0.5 overflow-hidden active:scale-95 transition-transform md:hidden">
              {initials}
            </Link>
          </header>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] h-5 w-5" />
              <input
                type="text"
                placeholder="Search by college, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm bg-white text-base focus:ring-2 focus:ring-[#9758FF] outline-none transition-shadow placeholder:text-gray-400 font-medium"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl shadow-sm transition-all flex-shrink-0 ${showFilters ? 'bg-[#9758FF] text-white' : 'bg-white text-[#9758FF] hover:bg-[#F8F5FF] active:scale-95'}`}
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md md:max-w-6xl mx-auto px-4 md:px-8 mt-6 md:mt-10">
        <AnimatePresence>
          {bookingOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeBooking}
                className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-xl font-bold text-[#111827]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                      Connect with {selectedMentor?.name ?? "Mentor"}
                    </h2>
                    <p className="text-sm font-semibold text-[#6B7280]">
                      ₹{selectedMentor?.pricePerMin ?? 5}/min • Pay as you go
                    </p>
                  </div>
                  <button
                    onClick={closeBooking}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto min-h-[440px]">
                  {bookingStep === 1 ? (
                    <div className="space-y-6">
                      {isMentorLive(selectedMentor?.id, selectedMentor?.is_available) && (
                        <div className="flex bg-gray-50 p-1 rounded-2xl">
                          <button
                            onClick={() => setBookingMode("instant")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                              bookingMode === "instant" ? "bg-white text-[#9758FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <Zap className="w-4 h-4" />
                            Connect Now
                          </button>
                          <button
                            onClick={() => setBookingMode("schedule")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                              bookingMode === "schedule" ? "bg-white text-[#9758FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule Later
                          </button>
                        </div>
                      )}

                      {bookingMode === "schedule" ? (
                        <>
                          <div>
                            <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Select Date
                            </h3>
                            <div className="mentoreo-datepicker">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => {
                                  setSelectedDate(date);
                                  setSelectedTime(null);
                                }}
                                minDate={new Date()}
                                filterDate={isDateAvailable}
                                placeholderText={availableDays.size > 0 ? "Select a date" : "No availability set"}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#9758FF] focus:outline-none transition-all font-medium text-[#111827] bg-white"
                                calendarClassName="mentoreo-datepicker__calendar"
                                dayClassName={() => "mentoreo-datepicker__day"}
                              />
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Available Slots
                            </h3>
                            {selectedDate ? (
                              availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                  {availableSlots.map((slot) => (
                                    <button
                                      key={slot}
                                      onClick={() => setSelectedTime(slot)}
                                      className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                        selectedTime === slot
                                          ? "border-[#9758FF] bg-[#F8F5FF] text-[#9758FF]"
                                          : "border-gray-100 bg-white text-gray-600 hover:border-[#E9D5FF]"
                                      }`}
                                    >
                                      {formatTime12(slot)}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-[#6B7280] bg-white border border-dashed border-gray-200 rounded-xl p-3">
                                  No availability for this date.
                                </div>
                              )
                            ) : (
                              <div className="text-sm text-[#6B7280] bg-white border border-dashed border-gray-200 rounded-xl p-3">
                                Select a date to view available slots.
                              </div>
                            )}
                          </div>

                          {selectedTime && (
                            <div>
                              <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Preferred Time (Optional)
                              </h3>
                              <input
                                type="time"
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#9758FF] focus:outline-none transition-all font-medium text-[#111827] bg-white"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-8 text-center bg-[#F8F5FF] rounded-2xl border border-[#E9D5FF]">
                          <div className="w-16 h-16 bg-[#9758FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-[#9758FF]" fill="#9758FF" />
                          </div>
                          <h3 className="text-lg font-bold text-[#111827] mb-2">Mentor is Live!</h3>
                          <p className="text-[#4B5563] text-sm max-w-[250px] mx-auto">
                            Start a chat instantly. You'll only be charged for the time you spend talking.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-[#F8F5FF] p-4 rounded-2xl border border-[#E9D5FF]">
                        <h3 className="font-bold text-[#111827] mb-1">Session Info</h3>
                      <p className="text-sm text-[#4B5563] font-medium">
                        {bookingMode === "instant"
                          ? "Instant Connection"
                          : `${selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Select date"} at ${selectedTime ? formatTime12(selectedTime) : "Select time"} ${preferredTime ? `(${preferredTime})` : "Slot"}`}
                      </p>
                        <div className="mt-4 pt-3 border-t border-[#E9D5FF] flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500">Rate</span>
                          <span className="text-xl font-black text-[#9758FF]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                            ₹{selectedMentor?.pricePerMin ?? 5}/min
                          </span>
                        </div>
                      <p className="text-xs text-[#6B21A8] mt-3 bg-white p-2 rounded-lg border border-[#E9D5FF]">
                        Payment is collected after the session. No upfront charge required.
                      </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-[#111827]">Add a note for {selectedMentor?.name ?? "Mentor"}</label>
                          <span className="text-xs text-gray-500 font-medium">{bookingNote.length}/100</span>
                        </div>
                        <textarea
                          value={bookingNote}
                          onChange={(e) => setBookingNote(e.target.value.slice(0, 100))}
                          placeholder="Briefly describe what you'd like to discuss... (Optional)"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#9758FF] focus:outline-none transition-all font-medium text-[#111827] bg-white resize-none min-h-[100px]"
                        />
                      </div>

                    <div className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#111827]">Payment</p>
                        <p className="text-xs font-semibold text-gray-500">You’ll be charged after the session ends.</p>
                      </div>
                    </div>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                  {bookingStep === 1 ? (
                    <button
                      disabled={bookingMode === "schedule" && (!selectedDate || !selectedTime)}
                      onClick={() => {
                        if (bookingMode === "instant") {
                          handleInstantContinue();
                          return;
                        }
                        setBookingStep(2);
                      }}
                      className="w-full py-4 bg-[#9758FF] hover:bg-[#8B5CF6] text-white rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#9758FF]/20 active:scale-[0.98]"
                    >
                      {bookingMode === "instant" ? "Connect Now" : "Continue"}
                    </button>
                  ) : (
                    <button
                      onClick={createBookingRequest}
                      className="w-full py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-base transition-all shadow-md shadow-black/10 active:scale-[0.98]"
                    >
                      Request Session
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* EXPANDABLE FILTERS PANEL */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#E9D5FF]">
              {/* Exam Focus Filter */}
              <div className="mb-5">
                <h4 className="text-sm font-bold text-[#6B21A8] mb-3 uppercase tracking-wider">Exam Focus</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveExam("All")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeExam === "All" ? 'bg-[#9758FF] text-white shadow-sm' : 'bg-[#F8F5FF] text-[#6B21A8] border border-[#E9D5FF] hover:bg-[#F3E8FF]'}`}
                  >
                    All Exams
                  </button>
                  {EXAMS.map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => setActiveExam(exam.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeExam === exam.id ? 'bg-[#9758FF] text-white shadow-sm' : 'bg-white text-[#4B5563] border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {exam.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* College Type Filter */}
              <div>
                <h4 className="text-sm font-bold text-[#6B21A8] mb-3 uppercase tracking-wider">College Type</h4>
                <div className="flex gap-2">
                  {['All', 'Public', 'Private'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCollegeType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1 ${collegeType === type ? 'bg-[#111827] text-white shadow-sm' : 'bg-white text-[#4B5563] border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPCOMING SESSIONS */}
        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Calendar className="h-5 w-5 text-[#9758FF]" />
                Your Sessions
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingSessions.map((s) => {
                const dateLabel = new Date(s.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const timeLabel = formatTime12(s.scheduled_time);
                const isAccepted = s.status === "upcoming";
                const chatUrl = `/student/chats/${buildCometUid(s.mentor_email)}`;

                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-[#111827] truncate">{mentors.find((m) => m.id === s.mentor_email)?.name ?? s.mentor_email}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAccepted
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {isAccepted ? "Accepted" : "Pending"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{s.topic}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#9758FF]" />{dateLabel}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#9758FF]" />{timeLabel}</span>
                      </div>
                    </div>
                    {isAccepted && (
                      <button
                        onClick={() => router.push(chatUrl)}
                        className="px-4 py-2 rounded-xl bg-[#9758FF] text-white text-xs font-bold hover:bg-[#8B5CF6] transition-colors whitespace-nowrap"
                      >
                        Join Chat
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECOMMENDED MENTORS */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <Sparkles className="h-5 w-5 text-[#9758FF]" fill="#9758FF" fillOpacity={0.2} /> 
              Mentors
            </h3>
            <Link
              href="/student/mentors"
              className="text-sm font-bold text-[#9758FF] hover:text-[#8B5CF6] transition-colors md:hidden"
            >
              See all
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <MentorCardSkeleton key={`mentor-skeleton-${index}`} />
              ))
            ) : error ? (
              <div className="w-full text-center py-10 bg-white rounded-[24px] border border-dashed border-gray-200">
                <p className="text-[#6B7280] font-medium">{error}</p>
                <button
                  onClick={() => fetchMentors()}
                  className="mt-3 text-[#9758FF] text-sm font-bold hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredMentors.length > 0 ? (
              filteredMentors.map((mentor, i) => (
                <motion.div 
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[280px] md:min-w-0 snap-center bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex flex-col relative hover:shadow-md hover:border-[#E9D5FF] transition-all"
                >
                  {/* <Link href={`/mentor/${encodeURIComponent(mentor.id)}`} className="absolute inset-0 z-10" aria-label={`View ${mentor.name}'s profile`} /> */}
                  
                  <div className="relative">
                    <img 
                      src={mentor.image ? mentor.image : "/student-logo.png"} 
                      alt={mentor.name} 
                      onError={(e) => {
                        e.currentTarget.src = "/student-logo.png";
                      }}
                      className="w-full h-40 object-cover rounded-[16px] mb-3"
                    />
                    {(mentor.is_verified || mentor.collegeType) && (
                      <div className="absolute top-2 left-2 flex flex-col gap-2">
                        {mentor.is_verified && (
                          <div className="bg-gradient-to-r from-[#E5E7EB] to-[#F3F4F6] text-gray-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-[#D1D5DB] text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                            Verified
                          </div>
                        )}
                        {mentor.collegeType && (
                          <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/10">
                            <Building2 className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{mentor.collegeType}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Rating Badge */}
                    {mentor.rating !== null && mentor.rating !== undefined && (
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
                        <span className="text-xs font-bold text-gray-900">{mentor.rating}</span>
                      </div>
                    )}
                    {isMentorLive(mentor.id, mentor.is_available) && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm text-[10px] uppercase tracking-wider font-nunito">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
                      </div>
                    )}
                  </div>
                  
                  <div className="px-1 flex flex-col flex-1 min-h-[10rem]">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#111827] text-lg leading-tight">{mentor.name}</h4>
                          {mentor.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDE4FF] text-[#6B21A8] text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9758FF]" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5" /> {mentor.college}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {(mentor.tags ?? []).map((tag, idx) => (
                        <span key={`${tag}-${idx}`} className="px-2 py-1 bg-[#F8F5FF] text-[#6B21A8] rounded-md text-[10px] font-bold border border-[#E9D5FF]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Session Fee</span>
                        <span className="text-sm font-bold text-[#111827]">₹{mentor.pricePerMin ?? 5}/min</span>
                      </div>
                      <button onClick={() => openBooking(mentor)} className="bg-[#111827] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm relative z-20 hover:bg-[#9758FF] transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-10 bg-white rounded-[24px] border border-dashed border-gray-200">
                <p className="text-[#6B7280] font-medium">No mentors found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-[#9758FF] text-sm font-bold hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* GOALS GRID */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-[#111827] mb-4 flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            What do you need help with?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {GOALS.map((goal) => {
              const Icon = goal.icon;
              return (
                <div 
                  key={goal.id} 
                  className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E9D5FF] transition-all cursor-pointer group flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm group-hover:text-[#9758FF] transition-colors">{goal.label}</h4>
                  </div>
                  <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 group-hover:text-[#9758FF] transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
