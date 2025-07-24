// File: /app/jobs/add/page.tsx

'use client';

import AddJobForm from '@/components/jobs/AddJobForm';
import Link from 'next/link';
import { FaRocket, FaThLarge, FaPlusCircle, FaFolder, FaBrain, FaChartLine, FaCrown, FaCog } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

export default function AddJobPage() {
  const { data: session } = useSession();

  return (
    <div className='flex'>
      {/* Sidebar - Komponen yang sama dari dashboard */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><FaRocket /> CareerPilot</div>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item"><FaThLarge /> Job Tracker</Link>
          <Link href="/jobs/add" className="nav-item active"><FaPlusCircle /> Add Job</Link>
          <a href="#" className="nav-item"><FaFolder /> Documents</a>
          <a href="#" className="nav-item"><FaBrain /> AI Tools</a>
          <a href="#" className="nav-item"><FaChartLine /> Dashboard</a>
          <a href="#" className="nav-item"><FaCrown /> Upgrade Plan</a>
          <a href="#" className="nav-item"><FaCog /> Settings</a>
        </nav>
        <div className="user-profile">
            <div className="user-avatar">{session?.user?.email?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{session?.user?.email}</div>
                <button onClick={() => signOut()} style={{fontSize: '0.8rem', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Logout</button>
            </div>
        </div>
      </div>

      {/* Main Content for Add Job Page */}
      <main className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Add New Job</h1>
            <p className="header-subtitle">Fill in the details to track a new opportunity</p>
          </div>
        </div>
        <div className="p-8">
          <AddJobForm />
        </div>
      </main>
    </div>
  );
}