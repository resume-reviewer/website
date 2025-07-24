"use client";
import { useState } from "react";
import { FaRocket } from "react-icons/fa";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Loading...");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok) setMessage("Register berhasil! Silakan login.");
    else setMessage(data.error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#c3cfe2] flex flex-col items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md border-t-4 border-[#667eea]">
        <div className="flex items-center gap-2 justify-center mb-6 font-extrabold text-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          <FaRocket className="text-[#667eea]" />
          CareerPilot
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-[#333]">Create your account</h2>
        <p className="text-center text-[#666] mb-6">Sign up to get started</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            Register
          </button>
        </form>
        {message && (
          <div className="text-center mt-4 text-[#667eea] font-medium">{message}</div>
        )}
        <div className="text-center mt-6 text-[#666]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#667eea] hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}