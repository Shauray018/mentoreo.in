import { supabase } from "@/lib/supabase";

const CHANNEL_NAME = "mentors-online";

export function joinMentorPresence(mentorEmail: string) {
  const channel = supabase.channel(CHANNEL_NAME, {
    config: { presence: { key: mentorEmail } },
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.track({ online_at: Date.now(), email: mentorEmail });
    }
  });

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}

export function subscribeOnlineMentors(onUpdate: (emails: Set<string>) => void) {
  const channel = supabase.channel(CHANNEL_NAME, {
    config: { presence: { key: "student" } },
  });

  const pushState = () => {
    const state = channel.presenceState();
    const emails = new Set<string>();
    Object.keys(state).forEach((key) => emails.add(key));
    onUpdate(emails);
  };

  channel.on("presence", { event: "sync" }, pushState);
  channel.on("presence", { event: "join" }, pushState);
  channel.on("presence", { event: "leave" }, pushState);

  channel.subscribe();

  const cleanup = () => {
    supabase.removeChannel(channel);
  };

  return { channel, cleanup };
}
