/**
 * Ensure a CometChat user exists for the given email.
 * Creates or updates the user on the CometChat side.
 */
export async function ensureCometChatUser(params: {
  email: string;
  name: string;
  avatar: string | null;
}): Promise<void> {
  await fetch("/api/cometchat/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
