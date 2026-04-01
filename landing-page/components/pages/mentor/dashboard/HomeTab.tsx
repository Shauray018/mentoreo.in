"use client";

import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import {
  BellRing,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Rocket,
  Users,
  Video,
} from "lucide-react";

export interface SessionRequest {
  id: string;
  studentName: string;
  studentImage: string | null;
  date: string;
  time: string;
  duration: string;
  earning: number;
  topic: string;
  requestedAt: string;
}

export interface LiveRequest {
  id: string;
  studentEmail?: string;
  studentName: string;
  type: "chat" | "call" | "video";
  topic: string;
  timeRequested: string;
  image: string;
  rate: number;
}

export interface TodaySession {
  id: string;
  studentEmail?: string | null;
  studentName: string;
  studentImage: string | null;
  date: string;
  time: string;
  topic: string;
}

interface HomeTabProps {
  isOnline: boolean;
  onToggleOnline: (value: boolean) => void;
  requests: SessionRequest[];
  upcomingSessions: TodaySession[];
  liveRequests: LiveRequest[];
  setLiveRequests: (next: LiveRequest[]) => void;
  onAcceptLiveRequest: (req: LiveRequest) => void;
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onStartScheduledChat: (session: TodaySession) => void;
  onCancelScheduled: (id: string) => void;
  onGoBoost: () => void;
}

export default function HomeTab({
  isOnline,
  onToggleOnline,
  requests,
  upcomingSessions,
  liveRequests,
  setLiveRequests,
  onAcceptLiveRequest,
  onAcceptRequest,
  onDeclineRequest,
  onStartScheduledChat,
  onCancelScheduled,
  onGoBoost,
}: HomeTabProps) {
  return (
    <div className="space-y-6">
      {/* <Card className={`border-0 shadow-sm transition-all ${isOnline ? "bg-gradient-to-br from-green-50 to-emerald-100/50" : "bg-gray-50"}`}>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
              {isOnline && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-40"></div>}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Live Status</h3>
              <p className="text-sm text-gray-600">
                {isOnline
                  ? "You are online and visible to students. Keep the app open to receive live requests."
                  : "Go online to receive live chat and call requests from students."}
              </p>
            </div>
          </div>
          <Switch
            checked={isOnline}
            onCheckedChange={onToggleOnline}
            className={isOnline ? "data-[state=checked]:bg-green-500" : ""}
          />
        </CardContent>
      </Card> */}

      <AnimatePresence>
        {isOnline && liveRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <BellRing className="w-5 h-5 text-[#FF7A1F]" />
                Live Requests
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100 animate-pulse">{liveRequests.length}</Badge>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveRequests.map((req) => (
                <Card key={req.id} className="border-2 border-[#FF7A1F]/20 shadow-sm hover:border-[#FF7A1F]/50 transition-colors bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF7A1F]"></div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img src={req.image} alt={req.studentName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                        <div>
                          <h4 className="font-bold text-gray-900">{req.studentName}</h4>
                          {req.topic && (
                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">{req.topic}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 bg-orange-50 text-[#FF7A1F] px-2 py-1 rounded-md text-xs font-bold">
                          {req.type === "video" ? <Video className="w-3 h-3" /> : req.type === "call" ? <Phone className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          <span className="capitalize">{req.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{req.timeRequested}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="text-sm font-bold text-gray-700">
                        ₹{req.rate} <span className="text-xs text-gray-400 font-normal">/min</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                          onClick={() => setLiveRequests(liveRequests.filter((r) => r.id !== req.id))}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-xl bg-[#FF7A1F] hover:bg-[#E66A15] text-white shadow-md shadow-orange-200"
                          onClick={() => onAcceptLiveRequest(req)}
                        >
                          Accept & Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className={`border shadow-sm bg-white ${requests.length > 0 ? "border-[#FF7A1F]/30 ring-1 ring-[#FF7A1F]/10" : "border-gray-100"}`}>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <Users className="w-5 h-5 text-[#FF7A1F]" />
              Session Requests
              {requests.length > 0 && (
                <Badge className="bg-red-100 text-red-600 hover:bg-red-100 animate-pulse">{requests.length}</Badge>
              )}
            </h3>
          </div>
          {requests.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/40">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={req.studentImage ?? "/someGuy.png"} alt={req.studentName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 text-sm truncate">{req.studentName}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{req.requestedAt}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5" title={req.topic}>{req.topic}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#FF7A1F]" />{req.date}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#FF7A1F]" />{req.time}</div>
                  </div>

                  <div className="flex items-center justify-end mt-1">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onDeclineRequest(req.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#FF7A1F] hover:bg-[#E66A15] text-white"
                        onClick={() => onAcceptRequest(req.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4">
              No pending session requests. When a student books a session, it will appear here for you to accept.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-[#FF7A1F]" />
              Upcoming Schedule
            </h3>
          </div>
          {(() => {
            const grouped = upcomingSessions.reduce<Record<string, TodaySession[]>>((acc, s) => {
              const key = s.date;
              if (!acc[key]) acc[key] = [];
              acc[key].push(s);
              return acc;
            }, {});
            const dateKeys = Object.keys(grouped).sort();

            if (dateKeys.length === 0) {
              return (
                <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4">
                  No upcoming sessions. Accepted requests will show up here.
                </div>
              );
            }

            return (
              <div className="space-y-5">
                {dateKeys.map((dateKey) => (
                  <div key={dateKey}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{dateKey}</p>
                    <div className="space-y-3">
                      {grouped[dateKey].map((session) => (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border border-orange-100 bg-orange-50/40">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img
                              src={session.studentImage ?? "/someGuy.png"}
                              alt={session.studentName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{session.studentName}</p>
                              <p className="text-xs text-gray-500 truncate">{session.topic}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-bold text-[#FF7A1F] bg-white px-2.5 py-1 rounded-full border border-orange-100">
                              {session.time}
                            </div>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-[#111827] hover:bg-black text-white"
                              onClick={() => onStartScheduledChat(session)}
                              disabled={!session.studentEmail}
                            >
                              Continue to Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => onCancelScheduled(session.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-[#FFF4ED] via-orange-50 to-orange-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF7A1F]/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between h-full gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5 text-[#FF7A1F]" />
              <h3 className="font-bold text-gray-900 text-lg">Campus Boost</h3>
            </div>
            <p className="text-sm text-gray-700 max-w-sm">
              Rally your college to the top of the leaderboard and unlock up to 80% payouts!
            </p>
          </div>
          <Button
            className="bg-[#FF7A1F] hover:bg-[#E66A15] text-white -z-10 rounded-xl shadow-md whitespace-nowrap w-full sm:w-auto"
            onClick={onGoBoost}
          >
            <Rocket className="w-4 h-4 mr-2" /> View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
