"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaRocket } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("Loading...");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
      router.push(res.url || "/dashboard");
    } else {
      setError("Login gagal. Cek email & password.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#c3cfe2] flex flex-col items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md border-t-4 border-[#667eea]">
        <div className="flex items-center gap-2 justify-center mb-6 font-extrabold text-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          <FaRocket className="text-[#667eea]" />
          CareerPilot
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-[#333]">Login to your account</h2>
        <p className="text-center text-[#666] mb-6">Welcome back! Please login.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="rounded-lg border border-[#e2e8f0] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#667eea] transition placeholder-[#444] text-[#222]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg border border-[#e2e8f0] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#667eea] transition placeholder-[#444] text-[#222]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-3 rounded-full font-semibold shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Login
          </button>
        </form>
        {error && (
          <div className="text-center mt-4 text-[#667eea] font-medium">{error}</div>
        )}
        <div className="text-center mt-6 text-[#666]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#667eea] hover:underline font-semibold">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}