import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- Impor dari lokasi baru

// Gunakan authOptions yang sudah diimpor
const handler = NextAuth(authOptions);

// Ekspor handler sebagai GET dan POST
export { handler as GET, handler as POST };