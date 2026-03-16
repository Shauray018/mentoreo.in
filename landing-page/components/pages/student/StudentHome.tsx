"use client";

import { useEffect, useState } from "react";
import { 
  Search, Sparkles, GraduationCap, Building2, 
  MapPin, SlidersHorizontal, Star, Briefcase, 
  Stethoscope, Palette, Cpu, ChevronRight, BookOpen, Target, FileText, Users
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import MentorCardSkeleton from "@/components/skeletons/MentorCardSkeleton";
import { useMentorBrowseStore } from "@/store/mentorBrowseStore";

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
  const [activeExam, setActiveExam] = useState("All");
  const [collegeType, setCollegeType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { mentors, loading, error, fetchMentors } = useMentorBrowseStore();

  useEffect(() => {
    if (!mentors.length) fetchMentors();
  }, [mentors.length, fetchMentors]);

  const filteredMentors = mentors.filter((m) =>
    (activeExam === "All" || !m.exam || m.exam === activeExam) &&
    (collegeType === "All" || !m.collegeType || m.collegeType === collegeType) &&
    (searchQuery === "" ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.college ?? "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                  <Link href={`/mentor/${encodeURIComponent(mentor.id)}`} className="absolute inset-0 z-10" aria-label={`View ${mentor.name}'s profile`} />
                  
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
                      {(mentor.tags ?? []).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-[#F8F5FF] text-[#6B21A8] rounded-md text-[10px] font-bold border border-[#E9D5FF]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Session Fee</span>
                        <span className="text-sm font-bold text-[#111827]">₹{mentor.pricePerMin ?? 5}/min</span>
                      </div>
                      <button className="bg-[#111827] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm relative z-20 hover:bg-[#9758FF] transition-colors">
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
