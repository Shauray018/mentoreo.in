import {
    UpdateMentorPayload,
    updateMentorProfile,
} from "@/services/mentorService";
import { useState } from "react";

export const useUpdateMentorProfile = () => {
  const [loading, setLoading] = useState(false);

  const saveProfile = async (payload: UpdateMentorPayload) => {
    try {
      setLoading(true);
      const data = await updateMentorProfile(payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveProfile,
    loading,
  };
};
