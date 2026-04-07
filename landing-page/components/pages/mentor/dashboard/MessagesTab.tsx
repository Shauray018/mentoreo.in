"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import CometChatPanel from "@/components/cometchat/CometChatPanel";
import { fetchMentorChats, type MentorChatRow } from "@/services/mentorChatsApi";
import { buildCometUid } from "@/lib/cometchat-uid";

interface MessagesTabProps {
  activeChatId?: string | null;
  onActiveChatChange?: (id: string | null) => void;
}

export default function MessagesTab({ activeChatId, onActiveChatChange }: MessagesTabProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<MentorChatRow[]>([]);
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetchMentorChats(email).then(setChats).catch(() => setChats([]));
  }, [session?.user?.email]);

  function getInitials(name: String) { 
    let initial = ""; 
    let arr = name.split(" "); 
    for (let n of arr) { 
      initial = initial + n[0]; 
    }
    return initial.toUpperCase();
  }

  const list = useMemo(() => {
    return chats.map((c) => ({
      id: c.id,
      name: c.student_name || "Student",
      initials: getInitials(c.student_name || "Student") ,
      email: c.student_email,
      image:
        c.student_avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      lastMessage: c.last_message || "Start a conversation",
      time: new Date(c.updated_at).toLocaleTimeString(),
      unread: c.unread_count ?? 0,
      chatRate: c.chat_rate ?? 0,
      callRate: c.call_rate ?? 0,
      cometUid: buildCometUid(c.student_email),
    }));
  }, [chats]);

  const showList = !activeChatId;

  return (
    <div className="bg-[#FFF8F3] md:rounded-[24px] md:border border-[#FFE8D9] p-0 md:p-6 h-full flex flex-col min-h-0 overflow-hidden">
      <div className="w-full flex-1 min-h-0 bg-white md:rounded-[24px] md:border border-[#F3E8FF] overflow-hidden">
        {showList ? (
          <div className="h-full overflow-y-auto py-6">
            <div className="space-y-3">
              {list.map((chat, i) => (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onActiveChatChange?.(chat.cometUid)}
                  className="w-full bg-white p-4 rounded-[20px] flex items-center gap-4 shadow-sm border border-[#F3E8FF] hover:border-[#FF7A1F]/50 hover:shadow-md transition-all text-left"
                >
                  <div className="relative">
                    {/* <img src={chat.image} alt={chat.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#F3E8FF]" /> */}
                      <div className="flex justify-center items-center w-12 h-12 rounded-full object-cover border-2 border-[#F3E8FF]">
                        {chat.initials}
                      </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-[#111827] text-base truncate">{chat.name}</h3>
                      <div className="flex items-center gap-2 bg-[#FFF2E8] text-[#FF7A1F] px-2 py-0.5 rounded-md border border-[#FFD9C2]">
                        <span className="text-[10px] font-bold">Chat: ₹{chat.chatRate}/min</span>
                        <div className="w-[1px] h-3 bg-[#FFD9C2]"></div>
                        <span className="text-[10px] font-bold">Call: ₹{chat.callRate}/min</span>
                      </div>
                    </div>
                    {/* <p className="text-[11px] text-[#6B7280] font-bold mb-1 truncate">{chat.email}</p> */}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${chat.unread > 0 ? "text-[#111827] font-bold" : "text-[#6B7280] font-medium"}`}>
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 ? (
                        <div className="w-6 h-6 bg-[#FF7A1F] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-[#FF7A1F]/30 flex-shrink-0">
                          {chat.unread}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-[#9CA3AF] whitespace-nowrap">{chat.time}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}

              {list.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-gray-200 mt-6">
                  <div className="w-16 h-16 bg-[#FFF2E8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-[#FF7A1F]" />
                  </div>
                  <h3 className="text-[#111827] font-bold text-lg mb-1">No chats yet</h3>
                  <p className="text-[#6B7280] font-medium text-sm">Accept a live request to start chatting.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CometChatPanel
            activeUid={activeChatId ?? undefined}
            chatId={list.find((chat) => chat.cometUid === activeChatId)?.id}
            className="w-full h-full"
            onBack={() => onActiveChatChange?.(null)}
            emptyTitle="Chat not found"
            emptyHint="Go back to messages and pick a conversation."
            billing={{ enabled: false, showTalkNow: false, ratePerMin: 0, minMinutes: 0 }}
          />
        )}
      </div>
    </div>
  );
}
