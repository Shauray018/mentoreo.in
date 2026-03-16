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
  IndianRupee,
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
  studentName: string;
  type: "chat" | "call" | "video";
  topic: string;
  timeRequested: string;
  image: string;
  rate: number;
}

interface HomeTabProps {
  isOnline: boolean;
  onToggleOnline: (value: boolean) => void;
  requests: SessionRequest[];
  liveRequests: LiveRequest[];
  setLiveRequests: (next: LiveRequest[]) => void;
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onGoBoost: () => void;
}

export default function HomeTab({
  isOnline,
  onToggleOnline,
  requests,
  liveRequests,
  setLiveRequests,
  onAcceptRequest,
  onDeclineRequest,
  onGoBoost,
}: HomeTabProps) {
  return (
    <div className="space-y-6">
      <Card className={`border-0 shadow-sm transition-all ${isOnline ? "bg-gradient-to-br from-green-50 to-emerald-100/50" : "bg-gray-50"}`}>
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
      </Card>

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
                          <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">{req.topic}</p>
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
                          onClick={() => setLiveRequests(liveRequests.filter((r) => r.id !== req.id))}
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

      {requests.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <Users className="w-5 h-5 text-[#FF7A1F]" />
              Session Requests
              <Badge className="bg-orange-100 text-[#FF7A1F] hover:bg-orange-100">{requests.length}</Badge>
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <Card key={req.id} className="border border-orange-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
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

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-bold text-gray-700 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-gray-500" />{req.earning}
                    </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
            className="bg-[#FF7A1F] hover:bg-[#E66A15] text-white rounded-xl shadow-md whitespace-nowrap w-full sm:w-auto"
            onClick={onGoBoost}
          >
            <Rocket className="w-4 h-4 mr-2" /> View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
