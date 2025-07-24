// File: /app/jobs/add/page.tsx
'use client';

import AddJobForm from '@/components/jobs/AddJobForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddJobPage() {
  return (
    // Menggunakan gaya dari HTML yang Anda berikan
    <div className="font-sans bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen">
       <a href="/dashboard" className="back-btn absolute top-8 left-8 no-underline">
          <FaArrowLeft />
          Back to Tracker
      </a>
      
      <div className="container mx-auto p-8">
        <header className="text-center mb-12">
            <h1 className="page-title">Add New Job</h1>
            <p className="page-subtitle">Let's add your next opportunity to track</p>
        </header>
        <AddJobForm />
      </div>
    </div>
  );
}