const BASE_URL = process.env.API_URL || "https://mentoreo-in.onrender.com";

export type UpdateMentorPayload = {
  email: string;
  display_name: string;
  bio: string;
  college: string;
  course: string;
  linkedin: string;
  avatar_url: string;
  rate_per_minute: number;
};

export const updateMentorProfile = async (payload: UpdateMentorPayload) => {
  const res = await fetch(
    `${BASE_URL}/mentors/${encodeURIComponent(payload.email)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_name: payload.display_name,
        bio: payload.bio,
        college: payload.college,
        course: payload.course,
        linkedin: payload.linkedin,
        avatar_url: payload.avatar_url,
        rate_per_minute: payload.rate_per_minute,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
};
