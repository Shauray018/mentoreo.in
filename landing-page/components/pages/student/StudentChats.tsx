"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, CheckCheck, IndianRupee } from "lucide-react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useStudentStore } from "@/store/studentStore";
import { useStudentData } from "@/hooks/useStudentData";
import { useOnlineMentors } from "@/hooks/useOnlineMentors";
import { useMentorBrowseStore } from "@/store/mentorBrowseStore";
import { buildCometUid } from "@/lib/cometchat-uid";

export default function StudentChats() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { chats, wallet } = useStudentStore();
  const onlineMentors = useOnlineMentors();
  const { mentors, fetchMentors } = useMentorBrowseStore();

  useStudentData(session?.user?.email ?? undefined);

  useEffect(() => {
    if (!mentors.length) fetchMentors();
  }, [mentors.length, fetchMentors]);

  const availabilityMap = new Map(mentors.map((m) => [m.id, Boolean(m.is_available)]));

  const derivedChats = chats.map((c) => ({
    id: c.id,
    name: c.mentor_name ?? "Mentor",
    role: c.mentor_email ?? "Mentor",
    lastMessage: c.last_message ?? "Start a conversation",
    time: new Date(c.updated_at).toLocaleTimeString(),
    unread: c.unread_count ?? 0,
    isOnline: Boolean(availabilityMap.get(c.mentor_email) && onlineMentors.has(c.mentor_email)),
    chatRate: c.chat_rate ?? 0,
    callRate: c.call_rate ?? 0,
    image:
      c.mentor_avatar ??
      "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    cometUid: buildCometUid(c.mentor_email ?? ""),
  }));

  const filteredChats = derivedChats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "unread") return matchesSearch && chat.unread > 0;
    return matchesSearch;
  });

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24 font-nunito">
      <div className="bg-gradient-to-br from-[#F6F2FF] via-[#EFEAFF] to-[#E3DCFF] px-4 pt-10 pb-6 rounded-b-[2.5rem] shadow-sm relative overflow-hidden md:rounded-[32px] md:m-4 md:mb-8">
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#9758FF] opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-[#D0B3FF] opacity-10 rounded-full blur-xl"></div>

        <div className="relative z-10 w-full max-w-md md:max-w-4xl mx-auto md:px-4">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827]" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Inbox
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[#6B21A8] text-sm font-bold">Wallet Balance:</p>
                <div className="bg-white/60 px-2 py-0.5 rounded-full flex items-center shadow-sm">
                  <span className="text-[#111827] text-sm font-black">
                    ₹{wallet?.balance_paise ? Math.floor(wallet.balance_paise / 100) : 0}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/student/wallet"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-md border-2 border-[#E9D5FF] flex items-center justify-center p-2 overflow-hidden hover:bg-gray-50 active:scale-95 transition-all text-[#9758FF]"
            >
              <IndianRupee className="w-6 h-6 md:w-7 md:h-7" />
            </Link>
          </header>

          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] h-5 w-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none shadow-sm bg-white text-base focus:ring-2 focus:ring-[#9758FF] outline-none transition-shadow placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md md:max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "all" ? "bg-[#111827] text-white shadow-md" : "bg-white text-[#6B7280] border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "unread" ? "bg-[#9758FF] text-white shadow-md" : "bg-white text-[#6B7280] border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Unread
            {chats.some((c) => c.unread > 0) && (
              <span className={`w-2 h-2 rounded-full ${activeTab === "unread" ? "bg-white" : "bg-[#9758FF]"}`}></span>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {filteredChats.map((chat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={chat.id}
              className="bg-white p-4 rounded-[20px] flex items-center gap-4 shadow-sm border border-[#F3E8FF] hover:border-[#9758FF]/50 hover:shadow-md transition-all cursor-pointer group relative"
            >
              <Link
                href={`/student/chats/${chat.cometUid}?mentor=${encodeURIComponent(chat.role)}`}
                className="absolute inset-0 z-10"
                aria-label={`Chat with ${chat.name}`}
              />
              <div className="relative">
                <img src={chat.image} alt={chat.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#F3E8FF]" />
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-[#111827] text-base truncate group-hover:text-[#9758FF] transition-colors">{chat.name}</h3>
                  <div className="flex items-center gap-2 bg-[#F8F5FF] text-[#9758FF] px-2 py-0.5 rounded-md border border-[#E1D4FF]">
                    <span className="text-[10px] font-bold">Chat: ₹{chat.chatRate}/min</span>
                    <div className="w-[1px] h-3 bg-[#E1D4FF]"></div>
                    <span className="text-[10px] font-bold">Call: ₹{chat.callRate}/min</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B21A8] font-bold mb-1 truncate">{chat.role}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    {chat.unread === 0 && <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    <p className={`text-sm truncate ${chat.unread > 0 ? "text-[#111827] font-bold" : "text-[#6B7280] font-medium"}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 ? (
                    <div className="w-6 h-6 bg-[#9758FF] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-[#9758FF]/30 flex-shrink-0">
                      {chat.unread}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#9CA3AF] whitespace-nowrap">{chat.time}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredChats.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white rounded-[24px] border border-dashed border-gray-200 mt-6">
              <div className="w-16 h-16 bg-[#F8F5FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[#9758FF]" />
              </div>
              <h3 className="text-[#111827] font-bold text-lg mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
                No messages found
              </h3>
              <p className="text-[#6B7280] font-medium text-sm">
                {searchQuery ? "Try a different search term." : "You haven't started any chats yet."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
