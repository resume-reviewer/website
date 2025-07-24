'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { JobDetails, InterviewSummary } from '@/lib/types-and-utils';

// Use dynamic imports for all components to prevent hydration issues
const InterviewSetup = dynamic(
  () => import('@/components/interview/interview-setup'),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
      </div>
    )
  }
);

const LiveInterview = dynamic(
  () => import('@/components/interview/live-interview'),
  { 
    ssr: false,
    loading: () => <p className="text-center p-8">Loading Interview Component...</p> 
  } 
);

const FeedbackSummary = dynamic(
  () => import('@/components/interview/feedback-summary'),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
      </div>
    )
  }
);
// ---------------------------------

type InterviewStage = 'setup' | 'live' | 'feedback';

export default function MockInterviewPage() {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [interviewContext, setInterviewContext] = useState<JobDetails | null>(null);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null);

  const handleSetupComplete = (context: JobDetails) => {
    setInterviewContext(context);
    setStage('live');
  };

  const handleInterviewComplete = (summary: InterviewSummary) => {
    setInterviewSummary(summary);
    setStage('feedback');
  };

  const handleStartOver = () => {
    setStage('setup');
    setInterviewContext(null);
    setInterviewSummary(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Mock Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice answering interview questions and get real-time feedback.
          </p>
        </div>

        {stage === 'setup' && (
          <InterviewSetup onSetupComplete={handleSetupComplete} />
        )}

        {stage === 'live' && interviewContext && (
          <LiveInterview
            interviewContext={interviewContext}
            onInterviewComplete={handleInterviewComplete}
          />
        )}

        {stage === 'feedback' && interviewSummary && (
          <FeedbackSummary
            summary={interviewSummary}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}