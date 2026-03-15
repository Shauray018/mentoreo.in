"use client";

import { User, Settings, LogOut, ChevronRight, CreditCard, HelpCircle } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { useStudentStore } from "@/store/studentStore";

export default function StudentProfile() {
  const { data: session } = useSession();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/" });
  };

  const { profile, fetchProfile, saveProfile } = useStudentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCollege, setFormCollege] = useState("");
  const [formClass, setFormClass] = useState("");

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetchProfile(email);
  }, [session?.user?.email]);

  const name = session?.user?.name ?? "Student";
  const email = session?.user?.email ?? "";
  useEffect(() => {
    setFormName(name);
  }, [name]);

  useEffect(() => {
    setFormPhone(profile?.phone ?? "");
    setFormCollege(profile?.college ?? "");
    setFormClass(profile?.class_level ?? "");
  }, [profile]);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    { icon: <User className="w-5 h-5 text-[#9758FF]" />, label: "Personal Information", link: "#" },
    { icon: <CreditCard className="w-5 h-5 text-[#9758FF]" />, label: "Payment Methods", link: "#" },
    { icon: <Settings className="w-5 h-5 text-[#9758FF]" />, label: "Settings & Privacy", link: "#" },
    { icon: <HelpCircle className="w-5 h-5 text-[#9758FF]" />, label: "Help Center", link: "#" },
  ];

  return (
    <div className="px-4 py-8 max-w-md md:max-w-3xl mx-auto min-h-screen bg-[#F8F9FA] md:bg-white pb-24 md:pb-8 font-nunito">
      <header className="flex justify-between items-center mb-8 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-[#111827]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Profile
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base mt-1">Manage your account</p>
        </div>
      </header>

      <div className="md:grid md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          {/* Profile Card */}
          <div className="bg-white md:bg-gray-50 rounded-3xl p-6 md:p-8 shadow-sm md:shadow-none border border-[#F3E8FF] md:border-gray-100 mb-8 text-center relative overflow-hidden">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-[#9758FF] to-[#D0B3FF] flex items-center justify-center text-white font-bold text-3xl md:text-4xl mx-auto mb-4 md:mb-6 border-4 border-white shadow-md">
              {initials}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#111827]">{name}</h3>
            <p className="text-[#6B7280] font-medium mt-1">{profile?.college || "Student"}</p>
            <div className="mt-6 flex flex-col gap-2 bg-white md:bg-transparent rounded-xl p-3 md:p-0">
              <p className="text-sm md:text-base font-semibold text-[#374151]">
                {profile?.phone || "Phone not set"}
              </p>
              <p className="text-sm md:text-base text-[#9CA3AF]">{email}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-between">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl shadow-sm md:shadow-md border border-[#F3E8FF] overflow-hidden mb-8 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#111827]">Personal Information</h3>
                <p className="text-xs text-[#6B7280] font-semibold">Update your student details</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsEditing((v) => !v)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="student-name">Full name</Label>
                <Input
                  id="student-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="student-phone">Phone</Label>
                <Input
                  id="student-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="student-email">Email</Label>
                <Input id="student-email" value={email} disabled />
              </div>
              <div>
                <Label htmlFor="student-college">College / Class</Label>
                <Input
                  id="student-college"
                  value={formCollege}
                  onChange={(e) => setFormCollege(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="student-class">Class Level</Label>
                <Input
                  id="student-class"
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  className="bg-[#9758FF] hover:bg-[#8A4FFF] text-white rounded-xl"
                  onClick={async () => {
                    if (!email) return;
                    setSaving(true);
                    const payload = {
                      email,
                      name: formName.trim(),
                      phone: formPhone.trim(),
                      college: formCollege.trim(),
                      class_level: formClass.trim(),
                    };
                    await saveProfile(email, payload);
                    setSaving(false);
                    setIsEditing(false);
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}
          </div>

          {/* Menu Options */}
          <div className="bg-white rounded-3xl shadow-sm md:shadow-md border border-[#F3E8FF] overflow-hidden mb-8">
            {menuItems.map((item, i) => (
              <Link key={i} href={item.link} className={`flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-[#F9F5FF]' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-[#F8F5FF] p-2.5 rounded-xl">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[#374151] md:text-lg">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
              </Link>
            ))}
          </div>

          {/* Log Out */}
          <button 
            onClick={handleLogout}
            className="w-full md:w-auto md:ml-auto bg-[#FFF0F0] text-red-500 py-4 md:px-8 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-red-50 transition-colors md:mb-8"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
