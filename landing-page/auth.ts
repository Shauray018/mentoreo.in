import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS, server-side only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/mentor/login",
  },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch user with password hash from signups table
        const { data: signup, error } = await supabase
          .from("signups")
          .select("*")
          .eq("email", credentials.email as string)
          .single();

        if (error || !signup) return null;

        // If user signed up via Google they won't have a password
        if (!signup.password) return null;

        // Verify bcrypt hash using Supabase pgcrypto
        const { data: verified } = await supabase.rpc("verify_password", {
          input_password: credentials.password as string,
          hashed_password: signup.password,
        });

        if (!verified) return null;

        return {
          id: signup.id,
          email: signup.email,
          name: signup.name,
          image: null,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      if (account?.provider === "google") {
        const email =
          user?.email ??
          (profile as any)?.email ??
          token?.email ??
          null;

        if (!email) {
          token.unregistered = true;
          token.unregisteredEmail = "";
          return token;
        }

        const { data: signup } = await supabase
          .from("signups")
          .select("email")
          .eq("email", email)
          .single();

        if (!signup) {
          token.unregistered = true;
          token.unregisteredEmail = email;
        } else {
          token.unregistered = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token?.sub ?? "";
      }
      if (token.unregistered) {
        (session as any).unregistered = true;
        (session as any).unregisteredEmail = token.unregisteredEmail;
      }
      return session;
    },
  },
});