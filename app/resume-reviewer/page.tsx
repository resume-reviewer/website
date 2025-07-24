'use client';

import { useState } from 'react';
import ResumeReviewerForm from '@/components/resume-reviewer/form';
import AnalysisResult from '@/components/resume-reviewer/analysis-result';
import { ResumeAnalysis } from '@/lib/types-and-utils';

export default function ResumeReviewerPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnalysisComplete = (analysisResult: ResumeAnalysis) => {
    setAnalysis(analysisResult);
    setShowResults(true);
  };

  const handleStartOver = () => {
    setAnalysis(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showResults ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Resume Reviewer
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get instant, personalized feedback on your resume tailored to specific job requirements. 
                Our AI analyzes your resume against job descriptions and provides actionable insights to improve your chances.
              </p>
            </div>

            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Job Details</h3>
                  <p className="text-gray-600 text-sm">Provide information about the job you're applying for</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Upload Resume</h3>
                  <p className="text-gray-600 text-sm">Upload your resume in PDF or text format</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Get Analysis</h3>
                  <p className="text-gray-600 text-sm">Receive detailed feedback and improvement suggestions</p>
                </div>
              </div>
            </div>

            <ResumeReviewerForm onAnalysisComplete={handleAnalysisComplete} />
          </>
        ) : (
          analysis && (
            <AnalysisResult 
              analysis={analysis} 
              onStartOver={handleStartOver}
            />
          )
        )}
      </div>
    </div>
  );
}