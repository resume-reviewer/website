'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
// --- GANTI TIPE IMPORT ---
import { JobApplication, InterviewSummary } from '@/lib/types-and-utils'; 
import { signOut, useSession } from 'next-auth/react';
import { FaRocket, FaThLarge, FaPlusCircle, FaFolder, FaBrain, FaChartLine, FaCrown, FaCog } from 'react-icons/fa';
import Sidebar from '@/components/layout/Sidebar';

// Definisikan tipe konteks di sini atau impor
type InterviewContext = Pick<JobApplication, 'job_title' | 'company_name' | 'job_description' | 'language'>;

const InterviewSetup = dynamic(() => import('@/components/interview/interview-setup'), { ssr: false });
const LiveInterview = dynamic(() => import('@/components/interview/live-interview'), { ssr: false });
const FeedbackSummary = dynamic(() => import('@/components/interview/feedback-summary'), { ssr: false });

type InterviewStage = 'setup' | 'live' | 'feedback';

export default function MockInterviewPage() {
  const { data: session } = useSession();
  const [stage, setStage] = useState<InterviewStage>('setup');
  // --- GUNAKAN TIPE BARU UNTUK STATE ---
  const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null);

  const handleSetupComplete = (context: InterviewContext) => {
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
    <div className='flex'>
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">AI Mock Interview</h1>
            <p className="header-subtitle">Practice answering questions and get instant feedback</p>
          </div>
        </div>
        <div className="p-8">
          {stage === 'setup' && <InterviewSetup onSetupComplete={handleSetupComplete} />}
          {stage === 'live' && interviewContext && <LiveInterview interviewContext={interviewContext} onInterviewComplete={handleInterviewComplete} />}
          {stage === 'feedback' && interviewSummary && <FeedbackSummary summary={interviewSummary} onStartOver={handleStartOver} />}
        </div>
      </main>
    </div>
  );
}