"use client";

import { useEffect, useState } from "react";
import { 
  Search, Sparkles, GraduationCap, Building2, 
  MapPin, SlidersHorizontal, Star, Briefcase, 
  Stethoscope, Palette, Cpu, ChevronRight, BookOpen, Target, FileText, Users,
  Calendar, Zap, Phone, MessageCircle, Clock, X, CreditCard
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import MentorCardSkeleton from "@/components/skeletons/MentorCardSkeleton";
import { useMentorBrowseStore } from "@/store/mentorBrowseStore";
import { useStudentStore } from "@/store/studentStore";
import { useSession } from "next-auth/react";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { sendLiveRequest, subscribeLiveResponses } from "@/services/liveRequests";
import { buildCometUid } from "@/lib/cometchat-uid";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[number] | null>(null);
  const { mentors, loading, error, fetchMentors } = useMentorBrowseStore();
  const { chats, fetchChats, createChat } = useStudentStore();
  const { data: session } = useSession();
  const onlineMentors = useOnlineMentors();

  useEffect(() => {
    if (!mentors.length) fetchMentors();
  }, [mentors.length, fetchMentors]);

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

  const filteredMentors = mentors.filter((m) =>
    (activeExam === "All" || !m.exam || m.exam === activeExam) &&
    (collegeType === "All" || !m.collegeType || m.collegeType === collegeType) &&
    (searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.college ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openBooking = (mentor: (typeof mentors)[number]) => {
    const isLive = Boolean(mentor.is_available && onlineMentors.has(mentor.id));
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

  const upcomingDates = ["Today", "Tomorrow", "Wed, 18 Mar", "Thu, 19 Mar", "Fri, 20 Mar", "Sat, 21 Mar"];
  const timeBlocks = ["Morning", "Afternoon", "Evening"];

  const ensureChatAndGo = async () => {
    const email = session?.user?.email;
    if (!email || !selectedMentor) {
      router.push("/student/login");
      return;
    }

    if (chats.length === 0) await fetchChats(email);
    const existing = chats.find((c) => c.mentor_email === selectedMentor.id);
    if (existing) {
      closeBooking();
      router.push(`/student/chats/${buildCometUid(existing.mentor_email)}?mentor=${encodeURIComponent(existing.mentor_email)}`);
      return;
    }

    const created = await createChat({
      student_email: email,
      mentor_email: selectedMentor.id,
      mentor_name: selectedMentor.name,
      mentor_avatar: selectedMentor.image ?? null,
      chat_rate: selectedMentor.pricePerMin ?? 5,
      call_rate: selectedMentor.pricePerMin ?? 5,
    });

    if (created) {
      closeBooking();
      const mentorEmail = created?.mentor_email || selectedMentor?.id || "";
      if (mentorEmail) router.push(`/student/chats/${buildCometUid(mentorEmail)}?mentor=${encodeURIComponent(mentorEmail)}`);
    }
  };

  const isMentorLive = (mentorId?: string | null, mentorAvailable?: boolean | null) =>
    Boolean(mentorAvailable && mentorId && onlineMentors.has(mentorId));

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
      toast(`${payload.mentorName} joined the chat`, {
        action: {
          label: "Open",
          onClick: () => router.push(`/student/chats/${buildCometUid(payload.mentorEmail)}?mentor=${encodeURIComponent(payload.mentorEmail)}`),
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
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Student" className="w-full h-full object-cover rounded-full" />
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
                className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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

                <div className="p-5 sm:p-6 overflow-y-auto">
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
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                              {upcomingDates.map((date) => (
                                <button
                                  key={date}
                                  onClick={() => setSelectedDate(date)}
                                  className={`px-5 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all border-2 ${
                                    selectedDate === date
                                      ? "border-[#9758FF] bg-[#F8F5FF] text-[#9758FF]"
                                      : "border-gray-100 bg-white text-gray-600 hover:border-[#E9D5FF]"
                                  }`}
                                >
                                  {date}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-[#6B21A8] uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Available Times
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                              {timeBlocks.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                    selectedTime === time
                                      ? "border-[#9758FF] bg-[#F8F5FF] text-[#9758FF]"
                                      : "border-gray-100 bg-white text-gray-600 hover:border-[#E9D5FF]"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
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
                            : `${selectedDate ?? "Select date"} at ${selectedTime ?? "Select time"} ${preferredTime ? `(${preferredTime})` : "Slot"}`}
                        </p>
                        <div className="mt-4 pt-3 border-t border-[#E9D5FF] flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500">Rate</span>
                          <span className="text-xl font-black text-[#9758FF]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                            ₹{selectedMentor?.pricePerMin ?? 5}/min
                          </span>
                        </div>
                        <p className="text-xs text-[#6B21A8] mt-3 bg-white p-2 rounded-lg border border-[#E9D5FF]">
                          You will only be charged based on your session's duration. Minimum wallet balance required to connect: ₹100
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
                          <p className="text-sm font-bold text-[#111827]">Wallet Balance</p>
                          <p className="text-xs font-semibold text-green-600">₹1,500 Available</p>
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
                      Continue
                    </button>
                  ) : (
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={ensureChatAndGo}
                        className="flex-1 py-3 sm:py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/10 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={ensureChatAndGo}
                        className="flex-1 py-3 sm:py-4 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/10 active:scale-[0.98] flex flex-col items-center justify-center gap-1.5"
                      >
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Call</span>
                      </button>
                    </div>
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

        {/* RECOMMENDED MENTORS */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <Sparkles className="h-5 w-5 text-[#9758FF]" fill="#9758FF" fillOpacity={0.2} /> 
              Mentors
            </h3>
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
                    {/* College Type Badge */}
                    {mentor.collegeType && (
                      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/10">
                        <Building2 className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{mentor.collegeType}</span>
                      </div>
                    )}
                    {/* Rating Badge */}
                    {mentor.rating !== null && mentor.rating !== undefined && (
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
                        <span className="text-xs font-bold text-gray-900">{mentor.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-1 flex flex-col flex-1 min-h-[10rem]">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-bold text-[#111827] text-lg leading-tight">{mentor.name}</h4>
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
