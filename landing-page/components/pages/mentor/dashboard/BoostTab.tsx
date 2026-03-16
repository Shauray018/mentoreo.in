"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Building2, Rocket, Share2 } from "lucide-react";

const colleges = [
  { rank: 1, name: "IIT Delhi", mentors: 124, payout: "80%" },
  { rank: 2, name: "BITS Pilani", mentors: 98, payout: "75%" },
  { rank: 3, name: "NIT Trichy", mentors: 85, payout: "70%" },
  { rank: 4, name: "VIT Vellore", mentors: 64, payout: "70%" },
  { rank: 5, name: "DTU", mentors: 42, payout: "70%" },
];

export default function BoostTab() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#FF7A1F]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <CardContent className="p-8 relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Rocket className="w-10 h-10 text-[#FF7A1F] drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Campus Boost</h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            Rally your college to the top of the leaderboard! Higher ranked colleges unlock better payout percentages for all their mentors.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="flex flex-col items-center p-4 bg-white rounded-2xl border-2 border-[#FF7A1F] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF7A1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Rank #1</div>
              <div className="text-4xl font-black text-[#FF7A1F] mb-1">80%</div>
              <h4 className="font-bold text-sm text-gray-800">Payout</h4>
              <p className="text-xs text-gray-500 text-center mt-1">For all mentors from the #1 college</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Rank #2</div>
              <div className="text-4xl font-black text-gray-800 mb-1">75%</div>
              <h4 className="font-bold text-sm text-gray-800">Payout</h4>
              <p className="text-xs text-gray-500 text-center mt-1">For all mentors from the #2 college</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Rank #3+</div>
              <div className="text-4xl font-black text-gray-600 mb-1">70%</div>
              <h4 className="font-bold text-sm text-gray-800">Payout</h4>
              <p className="text-xs text-gray-500 text-center mt-1">Standard payout for all other colleges</p>
            </div>
          </div>

          <Button className="bg-[#FF7A1F] hover:bg-[#E66A15] text-white rounded-xl px-8 py-6 text-lg shadow-lg shadow-orange-200 w-full sm:w-auto">
            <Share2 className="w-5 h-5 mr-2" /> Invite Campus Friends
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Live College Leaderboard
          </CardTitle>
          <CardDescription>Current standings. Rankings update daily.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {colleges.map((college) => {
              let cardStyle = "border-gray-100 bg-white hover:border-orange-200";
              let iconStyle = "bg-gray-50 text-gray-500";
              let badgeStyle = "border-gray-200 text-gray-600";

              if (college.rank === 1) {
                cardStyle = "border-yellow-400 bg-gradient-to-r from-yellow-50/50 to-transparent shadow-sm";
                iconStyle = "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-md shadow-yellow-200";
                badgeStyle = "border-yellow-400 text-yellow-700 bg-yellow-100/50 font-bold";
              } else if (college.rank === 2) {
                cardStyle = "border-slate-300 bg-gradient-to-r from-slate-50 to-transparent";
                iconStyle = "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-200";
                badgeStyle = "border-slate-300 text-slate-700 bg-white font-bold";
              } else if (college.rank === 3) {
                cardStyle = "border-amber-600/30 bg-gradient-to-r from-amber-50/50 to-transparent";
                iconStyle = "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-200";
                badgeStyle = "border-amber-300 text-amber-800 bg-white font-bold";
              }

              return (
                <div key={college.rank} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cardStyle}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${iconStyle}`}>
                      #{college.rank}
                    </div>
                    <div>
                      <h4 className={`font-bold ${college.rank <= 3 ? "text-gray-900 text-base" : "text-gray-700"}`}>{college.name}</h4>
                      <p className="text-xs text-gray-500">{college.mentors} Active Mentors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={badgeStyle}>
                      {college.payout} Payout
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
