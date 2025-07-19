import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error || !data.user) return null;
        //if (!data.user.email_confirmed_at) return null; // pastikan email sudah diverifikasi
        return {
            id: data.user.id,
            name: data.user.email,
            email: data.user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };