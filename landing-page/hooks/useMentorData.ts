import { useEffect } from "react";
import { useMentorStore } from "@/store/mentorStore";

export function useMentorData(email?: string) {
  const { fetchAll, clear } = useMentorStore();

  useEffect(() => {
    if (email) fetchAll(email);
    return () => clear();
  }, [email, fetchAll, clear]);
}
