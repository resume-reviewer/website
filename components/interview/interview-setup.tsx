'use client';

import { useState, useEffect } from 'react';
import { JobDetails } from '@/lib/types-and-utils';

interface InterviewSetupProps {
  onSetupComplete: (context: JobDetails) => void;
}

export default function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const [mounted, setMounted] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    jobTitle: '',
    company: '',
    jobDescription: '',
    requiredSkills: '',
    experienceLevel: '',
    industry: '',
  });
  const [error, setError] = useState('');

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof JobDetails, value: string) => {
    setJobDetails(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDetails.jobTitle || !jobDetails.jobDescription) {
      setError('Job Title and Job Description are required to start.');
      return;
    }
    setError('');
    onSetupComplete(jobDetails);
  };

  // Show loading state until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Set Interview Context</h2>
      <p className="text-gray-600 mb-6">Provide details about the role you are interviewing for to get tailored questions.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            value={jobDetails.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Engineer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea
            value={jobDetails.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the job description here..."
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Interview
          </button>
        </div>
      </form>
    </div>
  );
}