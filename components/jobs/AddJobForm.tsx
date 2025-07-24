// File: /components/jobs/AddJobForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddJobForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    location: '',
    job_url: '',
    job_description: '',
    notes: '',
    application_deadline: '',
  });

  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- PERBAIKAN PADA FUNGSI AUTO-FILL ---
  // 1. Terima event 'e' sebagai argumen
  const handleAutoFill = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 2. Cegah aksi default browser (submit form)
    e.preventDefault();

    if (!formData.job_url) {
      setError('Please provide a job URL to auto-fill.');
      return;
    }
    setIsScraping(true);
    setError('');
    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.job_url }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch job data.');
      }
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        job_title: data.jobTitle || prev.job_title,
        company_name: data.companyName || prev.company_name,
        location: data.location || prev.location,
        job_description: data.jobDescription || prev.job_description,
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      // 3. Blok ini sekarang dijamin akan dieksekusi
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title || !formData.company_name) {
      setError('Job Title and Company Name are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save job application.');
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelStyle = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border-t-4 border-indigo-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label htmlFor="job_url" className={labelStyle}>Job Link (Auto-fill)</label>
          <div className="flex items-center gap-2">
            <input 
              type="url" 
              name="job_url" 
              id="job_url" 
              value={formData.job_url} 
              onChange={handleInputChange} 
              className={`${inputStyle} flex-grow`} 
              placeholder="https://www.linkedin.com/jobs/view/..."/>
            <button 
              type="button" 
              // --- 4. Kirim event ke handler ---
              onClick={handleAutoFill} 
              disabled={isScraping} 
              className="px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition h-full"
            >
              {isScraping ? 'Fetching...' : 'Auto-fill'}
            </button>
          </div>
        </div>

        {/* ... sisa form Anda tetap sama ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="job_title" className={labelStyle}>Job Title *</label>
            <input type="text" name="job_title" id="job_title" value={formData.job_title} onChange={handleInputChange} required className={inputStyle} />
          </div>
          <div>
            <label htmlFor="company_name" className={labelStyle}>Company Name *</label>
            <input type="text" name="company_name" id="company_name" value={formData.company_name} onChange={handleInputChange} required className={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className={labelStyle}>Location</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange} className={inputStyle} />
          </div>
          <div>
            <label htmlFor="application_deadline" className={labelStyle}>Application Deadline</label>
            <input type="date" name="application_deadline" id="application_deadline" value={formData.application_deadline} onChange={handleInputChange} className={inputStyle} />
          </div>
        </div>
        <div>
          <label htmlFor="job_description" className={labelStyle}>Job Description</label>
          <textarea name="job_description" id="job_description" value={formData.job_description} onChange={handleInputChange} rows={6} className={inputStyle}></textarea>
        </div>
        <div>
          <label htmlFor="notes" className={labelStyle}>Personal Notes</label>
          <textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={3} className={inputStyle} placeholder="e.g., Contact person: John Doe, Referred by Jane..."></textarea>
        </div>
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="add-job-btn">
            {isSubmitting ? 'Saving...' : 'Save Job Application'}
          </button>
        </div>
      </form>
    </div>
  );
}