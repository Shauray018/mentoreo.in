"use client";

import { LogOut } from "lucide-react";
import { TABS, TabId } from "./constants";

interface MentorSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  onLogoClick: () => void;
  messagesBadge?: number;
}

export function MentorSidebar({ activeTab, onTabChange, onLogout, onLogoClick, messagesBadge = 0 }: MentorSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-orange-100 fixed h-full z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
          <img src="/icon.jpg" alt="Mentoreo Logo" className="w-10 h-10 object-contain rounded-xl" />
          <span className="font-bold text-2xl text-[#FF7A1F]" style={{ fontFamily: "Fredoka, sans-serif" }}>Mentoreo</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all ${
                isActive
                  ? "bg-[#FF7A1F] text-white shadow-md shadow-orange-200"
                  : "text-[#6B7280] hover:bg-orange-50 hover:text-[#FF7A1F]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.id === "messages" && messagesBadge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/90 text-[#FF7A1F]" : "bg-[#FF7A1F]/10 text-[#FF7A1F]"
                  }`}>
                    {messagesBadge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-orange-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

interface MentorMobileNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  messagesBadge?: number;
  hidden?: boolean;
}

export function MentorMobileNav({ activeTab, onTabChange, messagesBadge = 0, hidden = false }: MentorMobileNavProps) {
  return (
    <div className={`md:hidden fixed left-4 right-4 z-50 transition-all duration-300 ${hidden ? "-bottom-24" : "bottom-4"}`}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-2 flex justify-around items-center max-w-md mx-auto overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[4rem] px-2 h-14 rounded-xl transition-all ${
                isActive ? "text-[#FF7A1F] bg-orange-50" : "text-gray-400 hover:text-[#FF7A1F]/70"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {tab.id === "messages" && messagesBadge > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1.5 rounded-full bg-[#FF7A1F] text-white">
                    {messagesBadge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
