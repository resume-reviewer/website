// File: /components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaRocket, FaThLarge, FaPlusCircle, FaFolder, FaBrain } from 'react-icons/fa';

const NAV_ITEMS = [
  { href: '/dashboard', icon: <FaThLarge />, label: 'Job Tracker' },
  { href: '/jobs/add', icon: <FaPlusCircle />, label: 'Add Job' },
  { href: '/documents', icon: <FaFolder />, label: 'Documents' },
  { href: '/interview', icon: <FaBrain />, label: 'AI Mock Interview' },
  // Tambahkan link lain sesuai kebutuhan, misal Resume Reviewer
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo"><FaRocket /> CareerPilot</div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <div className="user-profile">
        <div className="user-avatar">{session?.user?.email?.charAt(0).toUpperCase() || 'U'}</div>
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{session?.user?.email}</div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })} 
            style={{ fontSize: '0.8rem', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Logout
          </button>
          </div>
      </div>
    </aside>
  );
}