// File: /lib/custom-types.d.ts

import 'next-auth';
import 'next-auth/jwt';

// Kode SpeechRecognition Anda yang sudah ada
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}


// --- MODIFIKASI TIPE NEXTAUTH ---
declare module 'next-auth' {
  /**
   * Mendefinisikan ulang tipe User, Session agar sesuai dengan kebutuhan kita
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