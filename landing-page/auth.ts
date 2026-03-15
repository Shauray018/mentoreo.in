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
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const role = (credentials.role as string | undefined) === "student" ? "student" : "mentor";
        const table = role === "student" ? "student_signups" : "signups";

        // Fetch user with password hash from signups table
        const { data: signup, error } = await supabase
          .from(table)
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
          role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Google({
      id: "google-student",
      name: "Google (Student)",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }

      if (account?.provider === "google-student") {
        const email =
          user?.email ??
          (profile as any)?.email ??
          token?.email ??
          null;

        const displayName =
          user?.name ??
          (profile as any)?.name ??
          (email ? email.split("@")[0] : "Student");

        if (!email) {
          token.unregistered = true;
          token.unregisteredEmail = "";
          return token;
        }

        const { data: studentSignup } = await supabase
          .from("student_signups")
          .select("id, email, name")
          .eq("email", email)
          .maybeSingle();

        if (!studentSignup) {
          const { data: created, error: createError } = await supabase
            .from("student_signups")
            .insert([{ name: displayName, email, password: null }])
            .select()
            .single();

          if (createError || !created) {
            token.unregistered = true;
            token.unregisteredEmail = email;
            return token;
          }
        }

        token.role = "student";
        token.unregistered = false;
        return token;
      }

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

        const { data: mentorSignup } = await supabase
          .from("signups")
          .select("email")
          .eq("email", email)
          .single();

        if (mentorSignup) {
          token.role = "mentor";
          token.unregistered = false;
        } else {
          token.unregistered = true;
          token.unregisteredEmail = email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token?.sub ?? "";
        (session.user as any).role = token?.role ?? undefined;
      }
      if (token.unregistered) {
        (session as any).unregistered = true;
        (session as any).unregisteredEmail = token.unregisteredEmail;
      }
      return session;
    },
  },
});
