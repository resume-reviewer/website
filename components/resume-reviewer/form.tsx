'use client';

import { useState } from 'react';
import { JobDetails, ResumeAnalysis, validateJobDetails, validateFile, formatFileSize } from '@/lib/types-and-utils';

interface ResumeReviewerFormProps {
  onAnalysisComplete: (analysis: ResumeAnalysis) => void;
}

export default function ResumeReviewerForm({ onAnalysisComplete }: ResumeReviewerFormProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    jobTitle: '',
    company: '',
    jobDescription: '',
    requiredSkills: '',
    experienceLevel: '',
    industry: '',
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const handleJobDetailsChange = (field: keyof JobDetails, value: string) => {
    setJobDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log('Extracting text from file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('File parsing failed:', response.status, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Failed to parse resume file');
      } catch (parseError) {
        // If error response is not JSON (like HTML error page)
        if (errorText.includes('<!DOCTYPE')) {
          throw new Error('Server error occurred while parsing file. Please try again.');
        }
        throw new Error(`Failed to parse resume file (${response.status})`);
      }
    }

    const { text } = await response.json();
    console.log('Successfully extracted', text.length, 'characters from file');
    return text;
  };

  const validateForm = () => {
    const jobDetailsError = validateJobDetails(jobDetails);
    if (jobDetailsError) return jobDetailsError;
    if (!resumeFile) return 'Resume file is required';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      let resumeText = '';
      
      if (resumeFile) {
        resumeText = await extractTextFromFile(resumeFile);
      }

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const { analysis } = await response.json();
      
      if (!analysis) {
        throw new Error('No analysis data received from server');
      }
      
      onAnalysisComplete(analysis);
      
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const basicValidation = !jobDetails.jobTitle.trim() || !jobDetails.company.trim() || !jobDetails.jobDescription.trim();
      if (basicValidation) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Resume Reviewer</h2>
        <p className="text-gray-600">Get AI-powered feedback on your resume for a specific job</p>
        
        {/* Progress Indicator */}
        <div className="mt-6 flex items-center">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>
              1
            </span>
            <span className="ml-2 text-sm font-medium">Job Details</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}>
              2
            </span>
            <span className="ml-2 text-sm font-medium">Upload Resume</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobDetails.jobTitle}
                  onChange={(e) => handleJobDetailsChange('jobTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={jobDetails.company}
                  onChange={(e) => handleJobDetailsChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  value={jobDetails.experienceLevel}
                  onChange={(e) => handleJobDetailsChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Mid Level">Mid Level (3-5 years)</option>
                  <option value="Senior Level">Senior Level (6-10 years)</option>
                  <option value="Lead/Principal">Lead/Principal (10+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  value={jobDetails.industry}
                  onChange={(e) => handleJobDetailsChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={jobDetails.jobDescription}
                onChange={(e) => handleJobDetailsChange('jobDescription', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the full job description here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills *
              </label>
              <textarea
                value={jobDetails.requiredSkills}
                onChange={(e) => handleJobDetailsChange('requiredSkills', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="List the key skills required for this position..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Upload Your Resume</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume File *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="resume-file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume-file"
                        name="resume-file"
                        type="file"
                        className="sr-only"
                        accept=".txt,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    TXT or PDF up to 10MB<br/>
                    <span className="text-amber-600">Note: For best results, use .txt files. PDF parsing may have limitations.</span>
                  </p>
                  {resumeFile && (
                    <div className="mt-2 p-2 bg-green-50 rounded border">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {resumeFile.name}
                      </p>
                      <p className="text-xs text-green-500">
                        {formatFileSize(resumeFile.size)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Previous
              </button>
              
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}