'use client';

import AddJobForm from '@/components/jobs/AddJobForm';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { FaArrowLeft, FaPlusCircle } from 'react-icons/fa'; 

export default function AddJobPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50"> 
      <Sidebar />
      
      <main className="main-content"> 
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                <FaPlusCircle className="text-white text-xl" /> 
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                  Add New Job
                </h1>
                <p className="text-slate-600 font-medium">Let's add your next opportunity to track</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <AddJobForm />
        </div>
      </main>
    </div>
  );
}