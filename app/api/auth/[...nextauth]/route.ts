// File: /app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

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

        // Pastikan kita mendapatkan user DAN session dari Supabase
        if (data.user && data.session) {
            return {
                id: data.user.id,
                email: data.user.email,
                // KITA MENYIMPAN TOKEN AKSES DI SINI
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
    // Callback ini dijalankan saat JWT dibuat
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Simpan token Supabase ke dalam token JWT NextAuth
        token.supabaseAccessToken = user.supabaseAccessToken;
      }
      return token;
    },
    // Callback ini dijalankan saat sesi diakses oleh client
    async session({ session, token }) {
      // Teruskan properti dari token ke objek sesi
      session.user.id = token.id;
      session.supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };