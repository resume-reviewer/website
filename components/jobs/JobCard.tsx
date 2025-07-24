// File: /components/jobs/JobCard.tsx

'use client';

import { JobApplication } from '@/lib/types-and-utils';
import { FaMapMarkerAlt, FaPaperPlane, FaEye } from 'react-icons/fa';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface JobCardProps {
  job: JobApplication;
}

export default function JobCard({ job }: JobCardProps) {
  const getCompanyInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      return 'a while ago';
    }
  };
  
  return (
    <div className="job-card">
      <div className="job-header">
        <div className="company-logo">{getCompanyInitial(job.company_name)}</div>
        <div className="job-info">
          <div className="job-title">{job.job_title}</div>
          <div className="company-name">{job.company_name}</div>
          {job.location && (
            <div className="job-location">
              <FaMapMarkerAlt size={12} />
              <span>{job.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="job-meta">
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
          {job.status === 'Applied' ? `Applied ${getTimeAgo(job.created_at)}` : `Saved ${getTimeAgo(job.created_at)}`}
        </div>
      </div>
      <div className="job-actions">
        <button className="action-btn action-primary">
          <FaPaperPlane />
          Apply
        </button>
        <button className="action-btn action-secondary">
          <FaEye />
          View
        </button>
      </div>
    </div>
  );
}