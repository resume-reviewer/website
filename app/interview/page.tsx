'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic'; // <-- Impor dynamic dari Next.js
import InterviewSetup from '@/components/interview/interview-setup';
import FeedbackSummary from '@/components/interview/feedback-summary';
import { JobDetails, InterviewSummary } from '@/lib/types-and-utils';

// --- INI ADALAH PERUBAHAN KUNCI ---
// Kita membuat versi dinamis dari LiveInterview
const LiveInterview = dynamic(
  () => import('@/components/interview/live-interview'),
  { 
    ssr: false, // <-- Ini secara eksplisit menonaktifkan Server-Side Rendering untuk komponen ini
    loading: () => <p className="text-center p-8">Loading Interview Component...</p> // <-- (Opsional) Tampilkan pesan loading
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