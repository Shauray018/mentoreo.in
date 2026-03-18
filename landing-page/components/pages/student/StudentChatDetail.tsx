"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Image as ImageIcon, Paperclip, IndianRupee, Clock, ShieldAlert, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useStudentStore } from "@/store/studentStore";
import { useCallSignaling } from "@/hooks/useCallSignaling";
import { useWebRTC } from "@/hooks/useWebRTC";
import type { CallType, SignalPayload } from "@/services/webrtcSignaling";

const CHAT_DATA: Record<string, {
  name: string;
  role: string;
  image: string;
  isOnline: boolean;
  chatRate: number;
  callRate: number;
  videoRate: number;
  messages: { id: string; sender: string; text: string; time: string }[];
}> = {
  "1": {
    name: "Aditi Rao",
    role: "JEE Mentor • IIT Bombay",
    image: "https://images.unsplash.com/photo-1750008559378-3f4b60a6b81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    isOnline: true,
    chatRate: 5,
    callRate: 10,
    videoRate: 15,
    messages: [
      { id: "1", sender: "them", text: "Hi! I saw you booked a session for tomorrow.", time: "10:00 AM" },
      { id: "2", sender: "me", text: "Yes! Looking forward to it.", time: "10:15 AM" },
      { id: "3", sender: "them", text: "Looking forward to our session tomorrow!", time: "10:30 AM" }
    ]
  },
  "2": {
    name: "Vikram Singh",
    role: "CAT Mentor • IIM A",
    image: "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    isOnline: false,
    chatRate: 8,
    callRate: 15,
    videoRate: 20,
    messages: [
      { id: "1", sender: "me", text: "Hi Vikram, could you review my resume?", time: "Yesterday" },
      { id: "2", sender: "them", text: "Yes, I can review your resume.", time: "Yesterday" }
    ]
  },
  "3": {
    name: "Sneha Reddy",
    role: "CUET Mentor • MIT Manipal",
    image: "https://images.unsplash.com/photo-1761125050322-bbfc155571bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    isOnline: true,
    chatRate: 4,
    callRate: 8,
    videoRate: 12,
    messages: [
      { id: "1", sender: "them", text: "Here are the notes we discussed. Let me know if you need anything else.", time: "Monday" }
    ]
  }
};

export default function StudentChatDetail() {
  const { id } = useParams();
  const router = useRouter();
  const chatId = String(id ?? "");
  const { data: session } = useSession();
  const { chats, messagesByChat, fetchMessages, fetchChats, wallet } = useStudentStore();
  const storeChat = chats.find((c) => c.id === chatId);
  const chat = storeChat
    ? {
        name: storeChat.mentor_name ?? "Mentor",
        role: storeChat.mentor_email ?? "Mentor",
        image: storeChat.mentor_avatar ?? "https://images.unsplash.com/photo-1604177091072-b7b677a077f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        isOnline: storeChat.is_online ?? false,
        chatRate: storeChat.chat_rate ?? 0,
        callRate: storeChat.call_rate ?? 0,
        videoRate: storeChat.call_rate ?? 0,
        messages: messagesByChat[chatId]?.map((m) => ({
          id: m.id,
          sender: m.sender === "student" ? "me" : "them",
          text: m.body,
          time: new Date(m.created_at).toLocaleTimeString(),
        })) ?? [],
      }
    : CHAT_DATA[chatId as keyof typeof CHAT_DATA];
  
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>(chat?.messages || []);
  const [inputText, setInputText] = useState("");
  
  // Astrotalk-like billing state
  const [sessionType, setSessionType] = useState<"idle" | "requesting" | "chat" | "call" | "video" | "ended">("idle");
  const [requestedType, setRequestedType] = useState<CallType | "chat" | null>(null);
  const [walletBalance, setWalletBalance] = useState((wallet?.balance_paise ?? 0) / 100);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [activeRate, setActiveRate] = useState(0);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallType | null>(null);
  const [outgoingCallType, setOutgoingCallType] = useState<CallType | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const {
    localStream,
    remoteStream,
    startCaller,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    endCall,
  } = useWebRTC();

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  useEffect(() => {
    const email = session?.user?.email;
    if (email && chats.length === 0) fetchChats(email);
    if (chatId) fetchMessages(chatId);
  }, [session?.user?.email, chatId]);

  useEffect(() => {
    if (chat?.messages) setMessages(chat.messages);
  }, [chatId, messagesByChat, chat?.messages]);

  useEffect(() => {
    if (wallet?.balance_paise != null) {
      setWalletBalance(wallet.balance_paise / 100);
    }
  }, [wallet?.balance_paise]);

  useEffect(() => {
    setIncomingCall(null);
    setOutgoingCallType(null);
    setSessionType("idle");
    setCallType(null);
    setSessionSeconds(0);
    endCall();
  }, [chatId, endCall]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((sessionType === 'chat' || sessionType === 'call' || sessionType === 'video') && chat) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
        
        if (sessionSeconds > 0 && sessionSeconds % 60 === 0) {
           setWalletBalance(prev => Math.max(0, prev - activeRate));
        }

        if (walletBalance <= 0) {
          setSessionType('ended');
        }

      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionType, sessionSeconds, walletBalance, chat, activeRate]);

  const role = "student" as const;
  const userId = session?.user?.email ?? "";

  const handleSignal = useCallback(
    async (payload: SignalPayload) => {
      if (payload.fromRole === role) return;
      if (payload.type === "call-request" && payload.callType) {
        if (sessionType === "call" || sessionType === "video") return;
        setIncomingCall(payload.callType);
      }
      if (payload.type === "call-accept" && payload.callType && outgoingCallType) {
        setCallType(payload.callType);
        setSessionType(payload.callType);
        await startCaller(
          payload.callType,
          (candidate) => sendSignal({ type: "ice", chatId, fromRole: role, fromId: userId, candidate }),
          (offer) => sendSignal({ type: "offer", chatId, fromRole: role, fromId: userId, callType: payload.callType, offer })
        );
        setOutgoingCallType(null);
      }
      if (payload.type === "call-decline") {
        setSessionType("idle");
        setRequestedType(null);
        setOutgoingCallType(null);
      }
      if (payload.type === "offer" && payload.offer && payload.callType) {
        setCallType(payload.callType);
        setSessionType(payload.callType);
        await handleOffer(
          payload.offer,
          payload.callType,
          (candidate) => sendSignal({ type: "ice", chatId, fromRole: role, fromId: userId, candidate }),
          (answer) => sendSignal({ type: "answer", chatId, fromRole: role, fromId: userId, answer })
        );
      }
      if (payload.type === "answer" && payload.answer) {
        await handleAnswer(payload.answer);
      }
      if (payload.type === "ice" && payload.candidate) {
        await addIceCandidate(payload.candidate);
      }
      if (payload.type === "hangup") {
        endCall();
        setSessionType("ended");
        setIncomingCall(null);
        setOutgoingCallType(null);
      }
    },
    [addIceCandidate, chatId, endCall, handleAnswer, handleOffer, outgoingCallType, role, sessionType, startCaller, userId]
  );

  const sendSignal = useCallSignaling(chatId, handleSignal);

  const requestSession = (type: "chat" | CallType, rate: number) => {
    if (!chat.isOnline) {
      alert("Mentor is currently offline. You will be notified when they are back.");
      return;
    }
    if (walletBalance < rate * 5) {
      alert(`Minimum 5 minutes balance required (₹${rate * 5}). Please recharge.`);
      return;
    }
    setActiveRate(rate);
    setRequestedType(type);
    setSessionSeconds(0);
    if (type === "chat") {
      setSessionType("chat");
      return;
    }
    setSessionType("requesting");
    setCallType(type);
    setOutgoingCallType(type);
    sendSignal({
      type: "call-request",
      chatId,
      fromRole: role,
      fromId: userId,
      callType: type,
      timestamp: Date.now(),
    });
  };

  if (!chat) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center font-nunito p-4">
        <h2 className="text-xl font-bold mb-2">Chat not found</h2>
        <button onClick={() => router.push("/student/chats")} className="text-[#9758FF] font-bold">Go back</button>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputText.trim() || sessionType !== 'chat') return;
    setMessages([
      ...messages,
      { id: String(Date.now()), sender: "me", text: inputText, time: "Just now" }
    ]);
    setInputText("");
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    setCallType(incomingCall);
    setSessionType(incomingCall);
    sendSignal({ type: "call-accept", chatId, fromRole: role, fromId: userId, callType: incomingCall });
    setIncomingCall(null);
  };

  const declineIncomingCall = () => {
    if (!incomingCall) return;
    sendSignal({ type: "call-decline", chatId, fromRole: role, fromId: userId, callType: incomingCall });
    setIncomingCall(null);
  };

  const totalCost = Math.ceil(sessionSeconds / 60) * activeRate;
  const isLowBalance = (sessionType === 'chat' || sessionType === 'call' || sessionType === 'video') && walletBalance < activeRate * 2;

  return (
    <div className="bg-[#F8F9FA] md:bg-transparent min-h-screen flex flex-col font-nunito w-full relative overflow-hidden">
      <div className="flex-1 w-full max-w-md md:max-w-4xl mx-auto bg-white md:shadow-md md:rounded-[32px] md:my-6 md:border border-gray-100 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/student/chats")}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={chat.image} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-[#111827] text-base leading-none">{chat.name}</h2>
                {sessionType === 'chat' || sessionType === 'call' || sessionType === 'video' ? (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-red-500">{formatTime(sessionSeconds)}</span>
                  </div>
                ) : (
                  <span className={`text-[11px] font-bold mt-1 ${chat.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                    {chat.isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <Link href="/student/wallet" className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${isLowBalance ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <IndianRupee className="w-3.5 h-3.5" />
              <span className="text-xs font-black">{walletBalance}</span>
            </Link>
            <span className="text-[10px] text-gray-400 font-bold mt-1 pr-1">Wallet</span>
          </div>
        </div>

        {incomingCall && sessionType === "idle" && (
          <div className="bg-[#111827] text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-3 relative z-20">
            Incoming {incomingCall === "video" ? "video" : "voice"} call from {chat.name}
            <div className="flex items-center gap-2">
              <button onClick={acceptIncomingCall} className="px-3 py-1 rounded-full bg-green-500 text-white text-[11px]">Accept</button>
              <button onClick={declineIncomingCall} className="px-3 py-1 rounded-full bg-red-500 text-white text-[11px]">Decline</button>
            </div>
          </div>
        )}

        {/* Low Balance Warning Banner */}
        {isLowBalance && (
          <div className="bg-red-500 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-2 relative z-20 shadow-md">
            <ShieldAlert className="w-4 h-4" />
            Low balance! Recharge now to continue.
            <Link href="/student/wallet" className="underline ml-1">Recharge</Link>
          </div>
        )}

        {/* MESSAGES / ACTIVE CALL UI */}
        <div className={`flex-1 overflow-y-auto p-4 flex flex-col ${sessionType === 'call' || sessionType === 'video' ? 'hidden' : 'pb-32 md:pb-40 space-y-4'}`}>
          {messages.map((msg, i) => {
            const isMe = msg.sender === "me";
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%] ${isMe ? 'self-end' : 'self-start'}`}
              >
                <div 
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMe 
                      ? 'bg-[#9758FF] text-white rounded-tr-sm shadow-sm shadow-[#9758FF]/20' 
                      : 'bg-white text-[#111827] rounded-tl-sm shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-1 px-1">
                  {msg.time}
                </span>
              </motion.div>
            );
          })}

          {sessionType === 'ended' && (
            <div className="bg-gray-100 rounded-xl p-4 text-center my-4 border border-gray-200 md:max-w-sm mx-auto">
              <h3 className="font-bold text-gray-800 mb-1">Session Ended</h3>
              <p className="text-sm text-gray-600 mb-3">Duration: {formatTime(sessionSeconds)} • Cost: ₹{totalCost}</p>
              <button 
                onClick={() => { setSessionType('idle'); setSessionSeconds(0); setActiveRate(0); }}
                className="bg-[#9758FF] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md w-full"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>

        {/* ACTIVE CALL UI */}
        {(sessionType === "call" || sessionType === "video") && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#111827] text-white relative p-6">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#111827] to-transparent"></div>

            {sessionType === "video" ? (
              <div className="absolute inset-0">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-6 right-6 w-32 h-44 md:w-40 md:h-56 object-cover rounded-2xl border border-white/20 shadow-xl" />
                <div className="absolute top-4 left-4 bg-black/40 px-2.5 py-1 rounded-full text-xs font-bold">
                  {formatTime(sessionSeconds)}
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center mb-10">
                <div className="w-32 h-32 md:w-40 md:h-40 relative">
                  <div className="absolute inset-0 bg-[#9758FF] rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-2 bg-[#9758FF] rounded-full animate-pulse opacity-40"></div>
                  <img src={chat.image} alt={chat.name} className="absolute inset-0 w-full h-full rounded-full object-cover border-4 border-[#111827] shadow-xl z-10" />
                </div>
                <h2 className="text-2xl font-bold mt-6" style={{ fontFamily: "Fredoka, sans-serif" }}>{chat.name}</h2>
                <p className="text-white/60 font-medium">Voice Call in progress</p>
                <p className="text-3xl font-black mt-4 font-mono">{formatTime(sessionSeconds)}</p>
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white/80 mt-2 flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   Deducting ₹{activeRate}/min
                </div>
              </div>
            )}

            <div className="absolute bottom-8 inset-x-0 flex justify-center gap-6 z-10">
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                 <MoreVertical className="w-6 h-6 text-white" />
              </button>
                  <button 
                  onClick={() => { sendSignal({ type: "hangup", chatId, fromRole: role, fromId: userId }); endCall(); setSessionType("ended"); }}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-transform active:scale-95 shadow-lg shadow-red-500/20"
              >
                 <Phone className="w-7 h-7 text-white transform rotate-[135deg]" />
              </button>
              {sessionType === 'video' ? (
                 <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                   <Video className="w-6 h-6 text-white" />
                 </button>
              ) : (
                 <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm">
                   <Phone className="w-6 h-6 text-white" />
                 </button>
              )}
            </div>
          </div>
        )}

        {/* INPUT AREA / CALL TO ACTION */}
        <div className={`bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 z-20 pb-safe md:pb-4 ${sessionType === 'call' || sessionType === 'video' ? 'hidden' : ''}`}>
          
          {sessionType === 'idle' && (
            <div className="p-4 bg-gradient-to-t from-white via-white to-white/90 pb-8 md:pb-4">
              <h4 className="text-center text-xs font-bold text-[#6B7280] mb-3 uppercase tracking-wider">Start a Consultation</h4>
              <div className="grid grid-cols-3 gap-2 md:max-w-xl md:mx-auto">
                <button 
                  onClick={() => requestSession('chat', chat.chatRate)}
                  className={`py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform border ${chat.isOnline ? 'bg-[#F8F5FF] hover:bg-[#E9D5FF] text-[#9758FF] border-[#E1D4FF]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                >
                  <MessageSquare className="w-5 h-5 mb-1" />
                  <span className="text-sm">Chat</span>
                  <span className={`text-[10px] ${chat.isOnline ? 'text-[#6B21A8]' : 'text-gray-400'}`}>₹{chat.chatRate}/min</span>
                </button>
                <button 
                  onClick={() => requestSession('call', chat.callRate)}
                  className={`py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform border ${chat.isOnline ? 'bg-[#F8F5FF] hover:bg-[#E9D5FF] text-[#9758FF] border-[#E1D4FF]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                >
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-sm">Call</span>
                  <span className={`text-[10px] ${chat.isOnline ? 'text-[#6B21A8]' : 'text-gray-400'}`}>₹{chat.callRate}/min</span>
                </button>
                <button 
                  onClick={() => requestSession('video', chat.videoRate)}
                  className={`py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform border ${chat.isOnline ? 'bg-[#F8F5FF] hover:bg-[#E9D5FF] text-[#9758FF] border-[#E1D4FF]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                >
                  <Video className="w-5 h-5 mb-1" />
                  <span className="text-sm">Video</span>
                  <span className={`text-[10px] ${chat.isOnline ? 'text-[#6B21A8]' : 'text-gray-400'}`}>₹{chat.videoRate}/min</span>
                </button>
              </div>
            </div>
          )}

          {sessionType === 'requesting' && (
            <div className="p-4 bg-gradient-to-t from-white via-white to-white/90 pb-8 md:pb-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#F8F5FF] flex items-center justify-center mb-3">
                <div className="w-6 h-6 border-2 border-[#9758FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h4 className="font-bold text-[#111827] text-lg">Requesting {requestedType}...</h4>
              <p className="text-sm text-[#6B7280]">Waiting for {chat.name} to accept.</p>
              <button 
                onClick={() => { sendSignal({ type: "call-decline", chatId, fromRole: role, fromId: userId }); setSessionType("idle"); setRequestedType(null); }}
                className="mt-4 px-6 py-2 rounded-xl text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 transition-colors"
              >
                Cancel Request
              </button>
            </div>
          )}

          {sessionType === 'chat' && (
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-[#9758FF] uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#9758FF] rounded-full animate-pulse"></div> Live Chat • ₹{activeRate}/min
                </span>
                <button 
                  onClick={() => setSessionType('ended')}
                  className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  End Chat
                </button>
              </div>
              <div className="flex items-end gap-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#9758FF] hover:bg-[#F8F5FF] transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-[#F8F9FA] rounded-2xl border border-gray-200 flex items-center pr-2 pl-4 py-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] text-sm py-2 font-medium"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                    inputText.trim() 
                      ? 'bg-[#9758FF] text-white shadow-[#9758FF]/30 hover:bg-[#8A4CE6]' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
