"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard", // tambahkan ini
    });
    console.log("signIn response:", res);
    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
      router.push(res.url || "/dashboard"); // gunakan url dari response
    } else {
      setError("Login gagal. Cek email & password.");
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-xs mx-auto mt-20">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}