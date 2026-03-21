import { useEffect, useState } from "react";
import { subscribeOnlineMentors } from "@/services/mentorPresence";

export function useOnlineMentors() {
  const [onlineMentors, setOnlineMentors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const { cleanup } = subscribeOnlineMentors(setOnlineMentors);
    return () => cleanup();
  }, []);

  return onlineMentors;
}
