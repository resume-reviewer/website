// File: /lib/custom-types.d.ts

// File ini adalah sebuah MODUL karena memiliki import.
// Tujuannya hanya untuk memperluas (augment) modul 'next-auth' dan 'next-auth/jwt'.

import type { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Mendefinisikan ulang tipe User dan Session
   */
  interface User {
    id: string;
    supabaseAccessToken?: string;
  }
  
  interface Session {
    supabaseAccessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Mendefinisikan ulang tipe token JWT
   */
  interface JWT {
    id: string;
    supabaseAccessToken?: string;
  }
}