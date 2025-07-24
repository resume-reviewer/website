// File: /components/jobs/JobCard.tsx
'use client';

import { useState } from 'react';
import { JobApplication } from '@/lib/types-and-utils';
import { FaMapMarkerAlt, FaEllipsisV, FaBuilding, FaFire, FaBolt, FaLeaf, FaMicrophone, FaDollarSign } from 'react-icons/fa';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

interface JobCardProps {
  job: JobApplication;
  onStatusChange: (jobId: string, newStatus: JobApplication['status']) => void;
}

const KANBAN_STATUSES: JobApplication['status'][] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

// Helper untuk styling priority
const PRIORITY_STYLES = {
  high: { icon: <FaFire />, color: 'text-red-500', bg: 'bg-red-100' },
  medium: { icon: <FaBolt />, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  low: { icon: <FaLeaf />, color: 'text-green-500', bg: 'bg-green-100' },
};

export default function JobCard({ job, onStatusChange }: JobCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getCompanyInitial = (name: string) => name ? name.charAt(0).toUpperCase() : <FaBuilding/>;
  const priority = job.priority || 'medium';
  const priorityStyle = PRIORITY_STYLES[priority];
  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return `${formatDistanceToNow(parseISO(dateString))} ago`;
  };
  
  const handleStatusUpdate = async (newStatus: JobApplication['status']) => {
      if (newStatus === job.status) return;
      setIsUpdating(true);
      setIsMenuOpen(false);
      try {
        const response = await fetch(`/api/jobs/${job.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        onStatusChange(job.id!, newStatus); // Update state di parent component
      } catch (error) {
        console.error("Error updating status:", error);
        // Bisa tambahkan notifikasi error untuk user
      } finally {
        setIsUpdating(false);
      }
  };
// --- FUNGSI UNTUK MEMULAI INTERVIEW ---
  const handlePracticeInterview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Mencegah menu tertutup jika sedang terbuka
    localStorage.setItem('interview_job_context', JSON.stringify({
      job_title: job.job_title,
      company_name: job.company_name,
      job_description: job.job_description,
    }));
    router.push('/interview');
  };
  
  return (
    <div className={`job-card flex flex-col justify-between p-4 rounded-lg border bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isUpdating ? 'opacity-50' : ''}`}>
      <div>
        {/* Header Kartu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="company-logo text-lg">
              {getCompanyInitial(job.company_name)}
            </div>
            <div>
              <h3 className="job-title font-bold text-gray-800 leading-tight">{job.job_title}</h3>
              <p className="company-name text-sm text-gray-500">{job.company_name}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <FaEllipsisV />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Move to</div>
                  {KANBAN_STATUSES.map(status => (
                    <a key={status} href="#" onClick={(e) => { e.preventDefault(); handleStatusUpdate(status); }}
                      className={`block px-4 py-2 text-sm ${job.status === status ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {status}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Detail Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 mb-4">
          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.location || 'N/A'}</span>
          {job.salary && <span className="flex items-center gap-1"><FaDollarSign /> {job.salary}</span>}
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.color}`}>
            {priorityStyle.icon} {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Footer Kartu & Aksi */}
      <div className="border-t pt-3 mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Added {getTimeAgo(job.created_at)}
        </p>
        <button 
          onClick={handlePracticeInterview}
          className="action-btn-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
        >
          <FaMicrophone />
          <span>Practice</span>
        </button>
      </div>
    </div>
  );
}