// File: /components/jobs/JobCard.tsx
'use client';

import { useState } from 'react';
import { JobApplication } from '@/lib/types-and-utils';
import { FaMapMarkerAlt, FaEllipsisV, FaBuilding, FaFire, FaBolt, FaLeaf, FaMicrophone, FaDollarSign, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface JobCardProps {
  job: JobApplication;
  onStatusChange: (jobId: string, newStatus: JobApplication['status']) => void;
  // Tambahkan onDragStart dan onDragEnd untuk fitur drag-and-drop
  onDragStart: (e: React.DragEvent, job: JobApplication) => void;
}

const KANBAN_STATUSES: JobApplication['status'][] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

// Helper untuk styling priority
const PRIORITY_STYLES = {
  high: { icon: <FaFire />, color: 'text-red-500', bg: 'bg-red-100' },
  medium: { icon: <FaBolt />, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  low: { icon: <FaLeaf />, color: 'text-green-500', bg: 'bg-green-100' },
};

export default function JobCard({ job, onStatusChange, onDragStart }: JobCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // State untuk modal detail

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

  const handlePracticeInterview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Mencegah menu/modal tertutup jika sedang terbuka
    localStorage.setItem('interview_job_context', JSON.stringify({
      job_title: job.job_title,
      company_name: job.company_name,
      job_description: job.job_description,
    }));
    router.push('/interview');
  };

  return (
    // Tambahkan draggable dan onDragStart
    <div 
      className={`job-card flex flex-col justify-between p-4 rounded-lg border bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isUpdating ? 'opacity-50' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, job)}
      onClick={() => setShowDetailModal(true)} // Buka modal saat kartu diklik
      style={{ cursor: 'grab' }} // Berikan indikator visual bahwa ini bisa di-drag
    >
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
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
              <FaEllipsisV />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Move to</div>
                  {KANBAN_STATUSES.map(status => (
                    <a key={status} href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusUpdate(status); }}
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

      {/* Detail Modal */}
      {showDetailModal && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailModal(false)} // Tutup modal jika klik di luar konten
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()} // Cegah penutupan modal saat klik di dalam konten
          >
            <button 
              onClick={() => setShowDetailModal(false)} 
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{job.job_title}</h2>
            <p className="text-gray-600 mb-2 flex items-center gap-2"><FaBuilding className="text-gray-500"/> {job.company_name}</p>
            <p className="text-gray-600 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-gray-500"/> {job.location || 'N/A'}</p>
            
            {job.job_url && (
              <a 
                href={job.job_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
              >
                <FaExternalLinkAlt/> View Job Post
              </a>
            )}

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{job.job_description || 'No description provided.'}</p>
            </div>

            {job.notes && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md">
                <div>
                    <p className="text-gray-500">Status:</p>
                    <p className="font-semibold text-gray-800">{job.status}</p>
                </div>
                <div>
                    <p className="text-gray-500">Priority:</p>
                    <p className="font-semibold text-gray-800 capitalize">{job.priority || 'Medium'}</p>
                </div>
                <div>
                    <p className="text-gray-500">Salary:</p>
                    <p className="font-semibold text-gray-800">{job.salary || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500">Deadline:</p>
                    <p className="font-semibold text-gray-800">{job.application_deadline ? format(parseISO(job.application_deadline), 'dd MMM yyyy') : 'N/A'}</p>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={handlePracticeInterview}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <FaMicrophone /> Practice Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}