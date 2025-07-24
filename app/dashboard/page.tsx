// File: /app/dashboard/page.tsx

'use client';

import { useState, useEffect, useMemo, JSX } from 'react';
import Link from 'next/link';
import { JobApplication } from '@/lib/types-and-utils';
import JobCard from '@/components/jobs/JobCard';
import { 
  FaRocket, FaThLarge, FaPlusCircle, FaFolder, FaBrain, FaChartLine, FaCrown, FaCog, 
  FaSearch, FaFilter, FaPlus, FaBookmark, FaPaperPlane, FaMicrophone, FaTrophy, FaTimes 
} from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';

const KANBAN_COLUMNS: { title: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'; icon: JSX.Element }[] = [
  { title: 'Saved', icon: <FaBookmark style={{ color: '#3b82f6' }} /> },
  { title: 'Applied', icon: <FaPaperPlane style={{ color: '#f59e0b' }} /> },
  { title: 'Interview', icon: <FaMicrophone style={{ color: '#8b5cf6' }} /> },
  { title: 'Offer', icon: <FaTrophy style={{ color: '#10b981' }} /> },
  { title: 'Rejected', icon: <FaTimes style={{ color: '#ef4444' }} /> },
];

export default function JobTrackerPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

  const stats = useMemo(() => {
    return KANBAN_COLUMNS.reduce((acc, col) => {
      acc[col.title] = jobs.filter(job => job.status === col.title).length;
      return acc;
    }, {} as Record<string, number>);
  }, [jobs]);

  return (
    <div className='flex'>
      {/* Sidebar - Diterjemahkan dari HTML Anda */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><FaRocket /> CareerPilot</div>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item active"><FaThLarge /> Job Tracker</Link>
          <Link href="/jobs/add" className="nav-item"><FaPlusCircle /> Add Job</Link>
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
      
      {/* Main Content - Diterjemahkan dari HTML Anda */}
      <main className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Job Applications</h1>
            <p className="header-subtitle">Track and manage your job search progress</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn"><FaFilter /> Filter</button>
            <Link href="/jobs/add" className="add-job-btn"><FaPlus /> Add Job</Link>
          </div>
        </div>
        
        <div className="stats-section">
            <div className="stat-card"><div className="stat-icon stat-saved"><FaBookmark /></div><div className="stat-info"><h3>{stats['Saved'] || 0}</h3><p>Saved Jobs</p></div></div>
            <div className="stat-card"><div className="stat-icon stat-applied"><FaPaperPlane /></div><div className="stat-info"><h3>{stats['Applied'] || 0}</h3><p>Applied</p></div></div>
            <div className="stat-card"><div className="stat-icon stat-interview"><FaMicrophone /></div><div className="stat-info"><h3>{stats['Interview'] || 0}</h3><p>Interviews</p></div></div>
            <div className="stat-card"><div className="stat-icon stat-offer"><FaTrophy /></div><div className="stat-info"><h3>{stats['Offer'] || 0}</h3><p>Offers</p></div></div>
        </div>

        <div className="kanban-section">
          {isLoading ? <p>Loading jobs...</p> : error ? <p>{error}</p> : (
            <div className="kanban-board">
              {KANBAN_COLUMNS.map(column => (
                <div className="kanban-column" key={column.title}>
                  <div className="column-header">
                    <div className="column-title">{column.icon} {column.title}</div>
                    <div className="column-count">{filteredJobs.filter(j => j.status === column.title).length}</div>
                  </div>
                  <div className="job-cards">
                    {filteredJobs.filter(j => j.status === column.title).map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}