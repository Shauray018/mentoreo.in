export function buildCometUid(email: string) {
  const base = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "_");
  const prefixed = `u_${base}`;
  return prefixed.length > 100 ? prefixed.slice(0, 100) : prefixed;
}
