"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";

const dummyChats = [
  {
    id: 1,
    student: { name: "Aarav M.", image: "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwc3R1ZGVudCUyMGxhcHRvcHxlbnwxfHx8fDE3NzIyMjAzNTF8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    lastMessage: "Thanks for the clarity on the CS syllabus!",
    timestamp: "10:30 AM",
    unread: 0,
    messages: [
      { id: 1, sender: "them", text: "Hi! Quick question about the CS course structure at IIT Delhi. Do we get to choose electives in the first year?", time: "10:15 AM" },
      { id: 2, sender: "me", text: "Hey Aarav! No, the first year is mostly common for all branches. You start picking electives from your third semester.", time: "10:25 AM" },
      { id: 3, sender: "them", text: "Ah okay, that makes sense. Thanks for the clarity on the CS syllabus!", time: "10:30 AM" },
    ]
  },
  {
    id: 2,
    student: { name: "Divya K.", image: "https://images.unsplash.com/photo-1750008560324-ed470d6081d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHN0dWRlbnQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjIyMDQzM3ww&ixlib=rb-4.1.0&q=80&w=1080" },
    lastMessage: "Are there any good coding clubs for beginners?",
    timestamp: "Yesterday",
    unread: 1,
    messages: [
      { id: 1, sender: "them", text: "Are there any good coding clubs for beginners?", time: "Yesterday" },
    ]
  },
  {
    id: 3,
    student: { name: "Rohan S.", image: "https://images.unsplash.com/photo-1675268919487-33bc3c4c0892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYWxlJTIwdGVlbmFnZXIlMjBzdHVkZW50fGVufDF8fHx8MTc3MjczNjY1M3ww&ixlib=rb-4.1.0&q=80&w=1080" },
    lastMessage: "Perfect, see you at 4:30 PM!",
    timestamp: "2 days ago",
    unread: 0,
    messages: [
      { id: 1, sender: "me", text: "I confirmed our session for tomorrow. Make sure you write down your questions beforehand!", time: "2 days ago" },
      { id: 2, sender: "them", text: "Perfect, see you at 4:30 PM!", time: "2 days ago" },
    ]
  }
];

export default function MessagesTab() {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messagesTab, setMessagesTab] = useState<"all" | "unread">("all");
  const [messagesSearchQuery, setMessagesSearchQuery] = useState("");

  const activeChat = useMemo(
    () => (activeChatId ? dummyChats.find((c) => c.id === activeChatId) : null),
    [activeChatId]
  );

  if (activeChat) {
    return (
      <div className="bg-transparent flex flex-col font-nunito w-full relative overflow-hidden h-full flex-1">
        <div className="flex-1 w-full max-w-md md:max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 flex flex-col relative overflow-hidden md:rounded-[24px]">
          <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatId(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeChat.student.image} alt={activeChat.student.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-bold text-[#111827] text-base leading-none">{activeChat.student.name}</h2>
                  <span className="text-[11px] font-bold mt-1 text-green-500">Online</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF7A1F] hover:bg-orange-100 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF7A1F] hover:bg-orange-100 transition-colors">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col pb-6 space-y-4 bg-[#F8F9FA]">
            {activeChat.messages.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end self-end" : "items-start self-start"} max-w-[85%] md:max-w-[70%]`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? "bg-[#FF7A1F] text-white rounded-tr-sm shadow-sm shadow-orange-200"
                        : "bg-white text-[#111827] rounded-tl-sm shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="text-sm font-medium">{msg.text}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 px-1">{msg.time}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-white border-t border-gray-100 p-3 md:p-4">
            <div className="flex items-end gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#FF7A1F] hover:bg-orange-50 transition-colors flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-[#F8F9FA] rounded-2xl border border-gray-200 flex items-center pr-2 pl-4 py-1">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] text-sm py-2 font-medium"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (chatMessage.trim()) setChatMessage("");
                    }
                  }}
                />
              </div>
              <button
                onClick={() => { if (chatMessage.trim()) setChatMessage(""); }}
                disabled={!chatMessage.trim()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                  chatMessage.trim()
                    ? "bg-[#FF7A1F] text-white shadow-orange-200 hover:bg-[#E66A15]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredChats = dummyChats.filter((chat) => {
    const matchesSearch =
      chat.student.name.toLowerCase().includes(messagesSearchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(messagesSearchQuery.toLowerCase());
    if (messagesTab === "unread") return matchesSearch && chat.unread > 0;
    return matchesSearch;
  });

  return (
    <div className="bg-transparent flex flex-col font-nunito w-full relative overflow-hidden h-full">
      <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col relative h-full">
        <div className="w-full mx-auto flex-1 flex flex-col min-h-0">
          <div className="relative w-full max-w-xl mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] h-5 w-5" />
            <input
              type="text"
              placeholder="Search students or messages..."
              value={messagesSearchQuery}
              onChange={(e) => setMessagesSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#FF7A1F]/20 shadow-sm bg-white text-base focus:ring-2 focus:ring-[#FF7A1F] outline-none transition-shadow placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex gap-2 mb-6 px-1">
            <button
              onClick={() => setMessagesTab("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${messagesTab === "all" ? "bg-[#111827] text-white shadow-md" : "bg-white text-[#6B7280] border border-gray-200 hover:bg-gray-50"}`}
            >
              All Messages
            </button>
            <button
              onClick={() => setMessagesTab("unread")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${messagesTab === "unread" ? "bg-[#FF7A1F] text-white shadow-md" : "bg-white text-[#6B7280] border border-gray-200 hover:bg-gray-50"}`}
            >
              Unread
              {dummyChats.some((c) => c.unread > 0) && (
                <span className={`w-2 h-2 rounded-full ${messagesTab === "unread" ? "bg-white" : "bg-[#FF7A1F]"}`}></span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pb-8 min-h-0">
            {filteredChats.map((chat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className="bg-white p-4 rounded-[20px] flex items-center gap-4 shadow-sm border border-orange-50 hover:border-[#FF7A1F]/50 hover:shadow-md transition-all cursor-pointer group relative"
              >
                <div className="relative">
                  <img src={chat.student.image} alt={chat.student.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-50" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-[#111827] text-base truncate group-hover:text-[#FF7A1F] transition-colors">{chat.student.name}</h3>
                    {chat.unread > 0 ? (
                      <div className="w-6 h-6 bg-[#FF7A1F] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-orange-200 flex-shrink-0">
                        {chat.unread}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#9CA3AF] whitespace-nowrap">{chat.timestamp}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                      {chat.unread === 0 && <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      <p className={`text-sm truncate ${chat.unread > 0 ? "text-[#111827] font-bold" : "text-[#6B7280] font-medium"}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
