// File: /app/jobs/add/page.tsx
'use client';

import AddJobForm from '@/components/jobs/AddJobForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddJobPage() {
  return (
    // Menggunakan gaya dari HTML yang Anda berikan
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen relative p-8">
      <Link href="/dashboard" className="back-btn absolute top-8 left-8 z-10 no-underline">
        <FaArrowLeft />
        Back to Tracker
      </Link>
      
      <div className="container mx-auto">
        <header className="header text-center mb-12">
            <h1 className="page-title">Add New Job</h1>
            <p className="page-subtitle">Let's add your next opportunity to track</p>
        </header>
        <AddJobForm />
      </div>
    </div>
  );
}