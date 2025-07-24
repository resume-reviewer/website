// File: /lib/auth.ts

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

// Definisikan dan ekspor authOptions dari sini
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user && data.session) {
            return {
                id: data.user.id,
                email: data.user.email,
                supabaseAccessToken: data.session.access_token,
            };
        }
        
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.supabaseAccessToken = user.supabaseAccessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
  },
};