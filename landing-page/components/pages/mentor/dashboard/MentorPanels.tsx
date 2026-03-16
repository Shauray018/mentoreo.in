"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { Calendar, CheckCircle2, Clock, Users, X, History } from "lucide-react";
import type { SessionRequest } from "./HomeTab";

export interface HistorySession {
  id: string;
  studentName: string;
  studentImage: string | null;
  date: string;
  duration: string;
  earning: number;
  topic: string;
  status: string;
}

interface RequestsPanelProps {
  open: boolean;
  onClose: () => void;
  requests: SessionRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function MentorRequestsPanel({ open, onClose, requests, onAccept, onDecline }: RequestsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden mb-6"
        >
          <div className="p-4 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50/80 to-amber-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#FF7A1F]" />
                </div>
                <div>
                  <h3 className="text-sm" style={{ fontWeight: 700 }}>Session Requests</h3>
                  <p className="text-[11px] text-gray-400">Students waiting for your response</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {requests.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {requests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3.5 rounded-xl bg-white border border-orange-100 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <img src={req.studentImage ?? "/someGuy.png"} alt={req.studentName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="text-sm truncate" style={{ fontWeight: 600 }}>{req.studentName}</h4>
                            <span className="text-[10px] text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{req.requestedAt}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">{req.topic}</p>
                          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mb-2.5">
                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{req.date}</span>
                            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{req.time}</span>
                            <span className="text-[#FF7A1F]" style={{ fontWeight: 600 }}>+₹{req.earning}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-[#FF7A1F] hover:bg-[#FF6A0F] text-white rounded-lg px-3.5 h-7 text-xs flex-1" onClick={() => onAccept(req.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Accept
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500 rounded-lg h-7 text-xs px-2.5" onClick={() => onDecline(req.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5 text-gray-400">
                  <CheckCircle2 className="h-7 w-7 mx-auto mb-1.5 opacity-40" />
                  <p className="text-sm">All caught up! No pending requests.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  sessions: HistorySession[];
}

export function MentorHistoryPanel({ open, onClose, sessions }: HistoryPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden mb-6"
        >
          <div className="p-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                  <History className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-sm" style={{ fontWeight: 700 }}>Session History</h3>
                  <p className="text-[11px] text-gray-500">Your past completed and cancelled sessions</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div key={session.id} className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img src={session.studentImage ?? "/someGuy.png"} alt={session.studentName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm truncate" style={{ fontWeight: 600 }}>{session.studentName}</h4>
                        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md font-semibold">{session.status}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">{session.topic}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{session.date}</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{session.duration}</span>
                        </div>
                        <span className="text-[#FF7A1F]" style={{ fontWeight: 600 }}>+₹{session.earning}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
