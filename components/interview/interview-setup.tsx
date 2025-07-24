// File: /components/interview/interview-setup.tsx

'use client';

import { useState, useEffect } from 'react';
import { JobApplication } from '@/lib/types-and-utils';
import { FaFlagUsa, FaGlobeAsia } from 'react-icons/fa';

// Tipe untuk konteks wawancara, yang merupakan bagian dari JobApplication
type InterviewContext = Pick<JobApplication, 'job_title' | 'company_name' | 'job_description' | 'language'>;

interface InterviewSetupProps {
  onSetupComplete: (context: InterviewContext) => void;
}

export default function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const [context, setContext] = useState<Omit<InterviewContext, 'language'>>({
    job_title: '',
    company_name: '',
    job_description: '',
  });
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [error, setError] = useState('');

  // Cek localStorage untuk data dari Job Tracker
  useEffect(() => {
    const savedContext = localStorage.getItem('interview_job_context');
    if (savedContext) {
      const parsedContext: Partial<JobApplication> = JSON.parse(savedContext);
      setContext({
        job_title: parsedContext.job_title || '',
        company_name: parsedContext.company_name || '',
        job_description: parsedContext.job_description || '',
      });
      localStorage.removeItem('interview_job_context');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContext(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.job_title || !context.job_description) {
      setError('Job Title and Job Description are required.');
      return;
    }
    setError('');
    // Kirim objek konteks lengkap
    onSetupComplete({ ...context, language });
  };

  const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border-t-4 border-indigo-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className={labelStyle}>Interview Language</h3>
          <div className="flex gap-4">
            <button type="button" onClick={() => setLanguage('en')} className={`flex-1 p-4 rounded-lg border-2 transition ${language === 'en' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
              <FaFlagUsa className="mx-auto mb-2 text-2xl text-red-600"/> English
            </button>
            <button type="button" onClick={() => setLanguage('id')} className={`flex-1 p-4 rounded-lg border-2 transition ${language === 'id' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
              <FaGlobeAsia className="mx-auto mb-2 text-2xl text-green-600"/> Bahasa Indonesia
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="job_title" className={labelStyle}>Job Title *</label>
          <input type="text" name="job_title" id="job_title" value={context.job_title} onChange={handleInputChange} required className={inputStyle} placeholder="e.g., Software Engineer"/>
        </div>

        <div>
          <label htmlFor="job_description" className={labelStyle}>Job Description *</label>
          <textarea name="job_description" id="job_description" value={context.job_description} onChange={handleInputChange} required rows={8} className={inputStyle} placeholder="Paste job description here..."></textarea>
        </div>

        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="flex justify-end">
          <button type="submit" className="add-job-btn">
            Start Interview
          </button>
        </div>
      </form>
    </div>
  );
}