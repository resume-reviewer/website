'use client';

import AddJobForm from '@/components/jobs/AddJobForm';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function AddJobPage() {
  return (
    <div className="font-sans bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen">
      <Sidebar />
      
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