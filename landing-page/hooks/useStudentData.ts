import { useEffect } from "react";
import { useStudentStore } from "@/store/studentStore";

export function useStudentData(email?: string) {
  const { fetchChats, fetchWallet, fetchProfile, clear } = useStudentStore();

  useEffect(() => {
    if (!email) return;
    fetchProfile(email);
    fetchChats(email);
    fetchWallet(email);
    return () => clear();
  }, [email, fetchChats, fetchProfile, fetchWallet, clear]);
}
