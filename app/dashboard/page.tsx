"use client";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) return <div>Silakan login terlebih dahulu.</div>;

  return (
    <div>
      <h1>Selamat datang, {session.user?.email}!</h1>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}