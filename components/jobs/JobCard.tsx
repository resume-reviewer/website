// File: /components/jobs/JobCard.tsx

'use client';

import { JobApplication } from '@/lib/types-and-utils';
import { FaMapMarkerAlt, FaPaperPlane, FaEye, FaMicrophone } from 'react-icons/fa'; // <-- Tambahkan ikon microphone
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation'; // <-- Impor useRouter

interface JobCardProps {
  job: JobApplication;
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter(); // <-- Inisialisasi router

  const getCompanyInitial = (name: string) => { /* ... */ };
  const getTimeAgo = (dateString: string | undefined) => { /* ... */ };

  // --- BUAT FUNGSI BARU ---
  const handlePracticeInterview = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Mencegah event lain terpicu
    
    // Simpan detail pekerjaan ke localStorage agar bisa dibaca di halaman interview
    localStorage.setItem('interview_job_context', JSON.stringify({
      job_title: job.job_title,
      company_name: job.company_name,
      job_description: job.job_description,
    }));
    
    // Arahkan ke halaman interview
    router.push('/interview');
  };
  
  return (
    <div className="job-card">
      {/* ... (kode header kartu) ... */}
      <div className="job-actions">
        <button className="action-btn action-secondary" onClick={handlePracticeInterview}>
          <FaMicrophone />
          Practice
        </button>
        <button className="action-btn action-primary">
          <FaPaperPlane />
          Apply
        </button>
      </div>
    </div>
  );
}