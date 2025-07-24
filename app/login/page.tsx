"use client"
import { useState } from "react"
import type React from "react"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FaRocket, FaEye, FaEyeSlash } from "react-icons/fa"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    })

    if (res?.error) {
      setError(res.error)
    } else if (res?.ok) {
      router.push(res.url || "/dashboard")
    } else {
      setError("Login failed. Please check your credentials.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#7DD5DB]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3B6597]/20 rounded-full blur-3xl"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md border border-white/20 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
            <FaRocket className="text-white text-xl" />
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
            CareerPilot
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome Back</h2>
          <p className="text-slate-600">Sign in to continue your career journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="Enter your password"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <span className="relative z-10">{isLoading ? "Signing In..." : "Sign In"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <p className="text-slate-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#3B6597] hover:text-[#7DD5DB] font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
