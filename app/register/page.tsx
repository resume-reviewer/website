"use client"
import { useState } from "react"
import type React from "react"

import { FaRocket, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState<"success" | "error" | "">(""); 

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { text: "Contains number", met: /\d/.test(password) },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error"); 
      return;
    }

    setIsLoading(true);
    setMessage("");
    setMessageType("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(
        "Registration successful! Please check your email to confirm your account and then log in."
      );
      setMessageType("success"); 
    } else {
      setMessage(data.error || "Registration failed. Please try again.");
      setMessageType("error"); 
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#7DD5DB]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3B6597]/20 rounded-full blur-3xl"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20 relative z-10">
        <Image
          src="/media/logo.png"
          alt="CareerPilot Logo"
          width={160}
          height={40}
          className="object-contain"
        />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Create Account</h2>
          <p className="text-slate-600">Start your career transformation journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#7DD5DB] focus:border-transparent transition-all duration-300 placeholder-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className="w-full px-4 py-4 pr-12 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#7DD5DB] focus:border-transparent transition-all duration-300 placeholder-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {password && (
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm ${req.met ? "text-green-600" : "text-slate-400"}`}
                  >
                    <FaCheck className={`text-xs ${req.met ? "text-green-500" : "text-slate-300"}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full px-4 py-4 pr-12 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#7DD5DB] focus:border-transparent transition-all duration-300 placeholder-slate-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passwordRequirements.every((req) => req.met) || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <span className="relative z-10">{isLoading ? "Creating Account..." : "Create Account"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </form>

       {/* Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl ${
              messageType === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm text-center font-medium ${
                messageType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3B6597] hover:text-[#7DD5DB] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}