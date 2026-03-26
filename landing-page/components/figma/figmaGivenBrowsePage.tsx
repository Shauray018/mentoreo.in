"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Building2,
  SlidersHorizontal,
  ChevronLeft,
  Calendar,
  ChevronDown,
  Zap,
  Phone,
  MessageCircle,
  Clock,
  X,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { useMentorBrowseStore } from "@/store/mentorBrowseStore";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { AnimatePresence, motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useStudentStore } from "@/store/studentStore";
import { buildCometUid } from "@/lib/cometchat-uid";
import { sendLiveRequest, subscribeLiveResponses } from "@/services/liveRequests";
import { toast } from "sonner";

export default function BrowseMentors() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCollege, setActiveCollege] = useState("All");
  const { mentors, loading, error, fetchMentors } = useMentorBrowseStore();
  const onlineMentors = useOnlineMentors();
  const { data: session } = useSession();
  const { chats, fetchChats, createChat } = useStudentStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<"instant" | "schedule">("instant");
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[number] | null>(null);
  
  useEffect(() => {
    if (!mentors.length) fetchMentors();
  }, [mentors.length, fetchMentors]);

  const filters = useMemo(() => {
    const unique = Array.from(new Set(mentors.map((m) => m.exam).filter(Boolean))) as string[];
    return ["All", ...unique];
  }, [mentors]);

  const uniqueColleges = useMemo(
    () => ["All", ...Array.from(new Set(mentors.map((m) => m.college).filter(Boolean)))],
    [mentors]
  );

  const filteredMentors = mentors.filter((mentor) => {
    const tagPool = [
      ...(mentor.tags ?? []),
      mentor.exam ?? "",
      mentor.course ?? "",
      mentor.collegeType ?? "",
    ].filter(Boolean);

    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.college ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagPool.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStream = activeFilter === "All" || mentor.exam === activeFilter;
    const matchesCollege = activeCollege === "All" || mentor.college === activeCollege;

    return matchesSearch && matchesStream && matchesCollege;
  });

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
      router.push(`/student/chats/${buildCometUid(existing.mentor_email)}?mentor=${encodeURIComponent(existing.mentor_email)}&live=1`);
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
      if (mentorEmail) router.push(`/student/chats/${buildCometUid(mentorEmail)}?mentor=${encodeURIComponent(mentorEmail)}&live=1`);
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
    <div className="bg-[#F8F5FF] min-h-screen font-nunito flex justify-center">
      <div className="w-full max-w-md bg-[#F8F5FF] min-h-screen relative pb-6">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#F8F5FF]/90 backdrop-blur-md px-4 py-4 border-b border-[#E1D4FF]">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E1D4FF] text-[#4B5563]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-[#111827]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Find your Mentor
            </h1>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center bg-white rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#9758FF] transition-shadow">
              <Search className="absolute left-3.5 text-[#9CA3AF] h-4 w-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search mentors..."
                className="w-full pl-10 pr-[140px] py-3 bg-transparent border-none outline-none text-sm placeholder:text-gray-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 border-l border-gray-200 pl-2">
                <div className="relative flex items-center">
                  <select 
                    value={activeCollege}
                    onChange={(e) => setActiveCollege(e.target.value)}
                    className="appearance-none bg-transparent border-none text-xs font-bold text-[#6B21A8] focus:outline-none cursor-pointer py-2 pl-3 pr-8 max-w-[120px] truncate"
                  >
                    {uniqueColleges.map((college) => (
                      <option key={college} value={college}>
                        {college === "All" ? "All Colleges" : college}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 text-[#9CA3AF] h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>
            <button className="w-[46px] h-[46px] rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#9758FF] shrink-0">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Categories */}
        <div className="px-4 py-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeFilter === filter 
                    ? 'bg-[#9758FF] text-white shadow-md' 
                    : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="px-4 pb-2">
          <p className="text-sm text-[#6B7280] font-semibold">
            Showing <span className="text-[#9758FF] font-bold">{filteredMentors.length}</span> mentors
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="px-4 py-2 space-y-4">
          {loading ? (
            <div className="w-full text-center py-12 bg-white rounded-3xl border border-dashed border-[#E1D4FF]">
              <p className="text-[#6B7280] font-semibold">Loading mentors...</p>
            </div>
          ) : error ? (
            <div className="w-full text-center py-12 bg-white rounded-3xl border border-dashed border-[#E1D4FF]">
              <p className="text-[#6B7280] font-semibold">{error}</p>
              <button
                onClick={() => fetchMentors()}
                className="mt-3 text-[#9758FF] text-sm font-bold hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredMentors.length > 0 ? (
            filteredMentors.map((mentor) => {
              const isLive = Boolean(mentor.is_available && onlineMentors.has(mentor.id));
              const tags = [
                ...(mentor.tags ?? []),
                mentor.exam ?? "",
                mentor.course ?? "",
              ].filter(Boolean);
              return (
                <div key={mentor.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-[#E1D4FF] flex flex-col relative hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={mentor.image ?? mentor.avatar_url ?? "/student-logo.png"} 
                    alt={mentor.name} 
                    className="w-full h-60 object-cover rounded-[16px] mb-3"
                    onError={(e) => {
                      e.currentTarget.src = "/student-logo.png";
                    }}
                  />
                  {mentor.collegeType && (
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      <Building2 className="h-3 w-3 text-[#9758FF]" />
                      <span className="text-[10px] font-extrabold text-[#374151] uppercase tracking-wider">{mentor.collegeType}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-[#111827]/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg flex items-center gap-1">
                    <span className="text-xs font-bold">₹{mentor.pricePerMin ?? 5}</span>
                    <span className="text-[10px] text-gray-300">/min</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-[#111827] text-xl leading-tight flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {mentor.name}
                      {isLive && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm text-[10px] uppercase tracking-wider font-nunito">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Live
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-[#9758FF]" /> {mentor.college}
                    </p>
                  </div>
                  {mentor.rating !== null && mentor.rating !== undefined && (
                    <div className="flex items-center gap-1 bg-[#F8F5FF] px-2.5 py-1.5 rounded-xl border border-[#F3E8FF]">
                      <span className="text-sm font-bold text-[#9758FF]">{mentor.rating}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  {tags.slice(0, 6).map((tag, idx) => (
                    <span key={`${mentor.id}-${tag}-${idx}`} className="px-3 py-1 bg-[#F8F5FF] text-[#6B21A8] rounded-lg text-xs font-bold border border-[#F3E8FF]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3 border-t border-[#F3E8FF] flex gap-2 relative z-20">
                  <Button
                    variant="outline"
                    onClick={() => openBooking(mentor)}
                    className="flex-1 rounded-xl border-[#E1D4FF] text-[#4B5563] font-bold h-11 hover:bg-[#F8F5FF] hover:text-[#9758FF]"
                  >
                    View Profile
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openBooking(mentor);
                    }}
                    className="flex-1 rounded-xl bg-[#9758FF] hover:bg-[#8B5CF6] text-white font-bold h-11 shadow-md shadow-[#9758FF]/20 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </Button>
                </div>
              </div>
            );
            })
          ) : (
            <div className="w-full text-center py-12 bg-white rounded-3xl border border-dashed border-[#E1D4FF]">
              <p className="text-[#6B7280] font-semibold">No mentors found matching your search.</p>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
