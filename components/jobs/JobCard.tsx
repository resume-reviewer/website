// File: /components/jobs/JobCard.tsx

'use client';

import { useState } from 'react';
import { JobApplication } from '@/lib/types-and-utils';
import { FaMapMarkerAlt, FaEllipsisV, FaBuilding, FaMicrophone, FaDollarSign, FaExternalLinkAlt, FaTimes, FaEdit, FaTrash, FaCheckCircle, FaPaperPlane, FaFileAlt, FaLightbulb, FaRedo, FaLink } from 'react-icons/fa';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FcHighPriority, FcLowPriority, FcMediumPriority } from 'react-icons/fc';

// Import Dialog dan AddJobForm untuk modal
import { Dialog } from '@headlessui/react';
import AddJobForm from '@/components/jobs/AddJobForm'; // Akan digunakan sebagai form edit

interface JobCardProps {
  job: JobApplication;
  onStatusChange: (jobId: string, newStatus: JobApplication['status']) => void;
  onDragStart: (e: React.DragEvent, job: JobApplication) => void;
  onDeleteSuccess: (jobId: string) => void; // Callback baru untuk delete
  onEditSuccess: (updatedJob: JobApplication) => void; // Callback baru untuk edit
}

const KANBAN_STATUSES: JobApplication['status'][] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

const PRIORITY_STYLES = {
  high: { icon: <FcHighPriority />, color: 'text-red-500', bg: 'bg-red-100' },
  medium: { icon: <FcMediumPriority />, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  low: { icon: <FcLowPriority />, color: 'text-green-500', bg: 'bg-green-100' },
};

export default function JobCard({ job, onStatusChange, onDragStart, onDeleteSuccess, onEditSuccess }: JobCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // State untuk konfirmasi delete
  const [showEditModal, setShowEditModal] = useState(false); // State untuk modal edit

  const getCompanyInitial = (name: string) => name ? name.charAt(0).toUpperCase() : <FaBuilding />;
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
      onStatusChange(job.id!, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteJob = async () => {
    setIsUpdating(true);
    setShowConfirmDeleteModal(false);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete job');
      onDeleteSuccess(job.id!); // Beri tahu parent bahwa job sudah dihapus
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditJob = () => {
    setShowEditModal(true);
    setIsMenuOpen(false);
  };

  const handleEditFormSubmit = (updatedJobData: JobApplication) => {
    // Ini akan dipanggil oleh AddJobForm (sebagai mode edit)
    // Kemudian kita panggil onEditSuccess dari prop JobCard
    onEditSuccess(updatedJobData);
    setShowEditModal(false);
  };

  const handlePracticeInterview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    localStorage.setItem('interview_job_context', JSON.stringify({
      job_title: job.job_title,
      company_name: job.company_name,
      job_description: job.job_description,
    }));
    router.push('/interview');
  };

  const handleOptimizeResume = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    localStorage.setItem('resume_reviewer_job_context', JSON.stringify({
      jobTitle: job.job_title,
      company: job.company_name,
      jobDescription: job.job_description,
      // Anda mungkin perlu menambahkan requiredSkills, experienceLevel, industry
      // Jika data ini tidak ada di object job Anda, mungkin perlu diambil dari DB atau diinput manual di halaman resume reviewer
    }));
    router.push('/resume-reviewer');
  };

  const handleSendFollowUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    alert(`Sending follow-up for ${job.job_title} at ${job.company_name}. (Feature Coming Soon!)`);
    // Implementasi AI Cover Letter atau email follow-up bisa diarahkan ke sini
  };

  const renderStatusSpecificAction = () => {
    switch (job.status) {
      case 'Saved':
        return (
          <div></div>
        );
      case 'Applied':
        return (
          <button
            onClick={handleSendFollowUp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
          >
            <FaPaperPlane className="text-xs" /> Follow-up
          </button>
        );
      case 'Interview':
        return (
          <button
            onClick={handlePracticeInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full transition-colors"
          >
            <FaMicrophone className="text-xs" /> Practice
          </button>
        );
      case 'Offer':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); alert(`Accept Offer for ${job.job_title} at ${job.company_name}! Congrats!`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
          >
            <FaCheckCircle className="text-xs" /> Celebrate
          </button>
        );
      case 'Rejected':
        return (
          <button
            onClick={handleOptimizeResume}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-full transition-colors"
          >
            <FaLightbulb className="text-xs" /> Optimize
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`job-card flex flex-col justify-between p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[160px] ${isUpdating ? 'opacity-50' : ''} ${isMenuOpen ? 'relative z-50' : 'relative'}`}
      draggable
      onDragStart={(e) => onDragStart(e, job)}
      onClick={() => setShowDetailModal(true)}
      style={{ cursor: 'grab' }}
    >
      {/* Header Section */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            
            <div className="min-w-0 flex-1">
              <h3 className="job-title font-bold text-gray-800 leading-tight text-sm mb-1 truncate">{job.job_title}</h3>
              <p className="company-name text-xs text-gray-500 truncate">{job.company_name}</p>
            </div>
          </div>
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FaEllipsisV className="text-xs" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl z-[100] border border-gray-200 py-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">Move to</div>
                {KANBAN_STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusUpdate(status); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${job.status === status ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {status}
                  </button>
                ))}
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditJob(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FaEdit className="text-xs" /> Edit Job
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirmDeleteModal(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaTrash className="text-xs" /> Delete Job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.location || 'N/A'}</span>
          </div>
         
          <div className="flex items-center justify-between gap-2">
            {job.salary && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <FaDollarSign className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{job.salary}</span>
              </div>
            )}
           
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.color} flex-shrink-0`}>
              <span className="text-xs">{priorityStyle.icon}</span>
              <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="border-t border-gray-100 pt-3 flex-wrap justify-between items-center gap-3">
        <div className="flex-shrink-0">
          {renderStatusSpecificAction()}
        </div>
        <p className="text-xs mt-1 text-gray-400 flex-shrink-0">
          {getTimeAgo(job.created_at)}
        </p>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10"
              >
                <FaTimes />
              </button>
             
              <div className="pr-12 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{job.job_title}</h2>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaBuilding className="text-gray-500 flex-shrink-0"/>
                    <span>{job.company_name}</span>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500 flex-shrink-0"/>
                    <span>{job.location || 'N/A'}</span>
                  </p>
                </div>
              </div>
             
              {job.job_url && (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2 mb-6 transition-colors"
                >
                  <FaExternalLinkAlt className="flex-shrink-0"/> View Job Post
                </a>
              )}

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-3">Description</h3>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{job.job_description || 'No description provided.'}</p>
                </div>

                {job.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Notes</h3>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{job.notes}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg mb-6">
                <div>
                  <p className="text-gray-500 mb-1">Status:</p>
                  <p className="font-semibold text-gray-800">{job.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Priority:</p>
                  <p className="font-semibold text-gray-800 capitalize">{job.priority || 'Medium'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Salary:</p>
                  <p className="font-semibold text-gray-800">{job.salary || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Deadline:</p>
                  <p className="font-semibold text-gray-800">{job.application_deadline ? format(parseISO(job.application_deadline), 'dd MMM yyyy') : 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-end">
                {renderStatusSpecificAction()}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDeleteModal && (
        <Dialog open={showConfirmDeleteModal} onClose={() => setShowConfirmDeleteModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-bold text-gray-900 mb-3">Confirm Deletion</Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this job application? This action cannot be undone.
              </Dialog.Description>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Edit Job Modal */}
      {showEditModal && (
        <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-[60]">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[95vh] overflow-hidden relative z-10">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <Dialog.Title className="text-2xl font-bold text-gray-800">Edit Job Application</Dialog.Title>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <AddJobForm
                  initialData={job} // Teruskan data pekerjaan yang sedang di-edit
                  onFormSubmitSuccess={(updatedJob) => {
                    handleEditFormSubmit(updatedJob);
                    setShowDetailModal(false); // Tutup modal detail setelah edit
                  }}
                  isEditMode={true} // Mode edit diaktifkan
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}