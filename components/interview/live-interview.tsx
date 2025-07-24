'use client';

import { useState, useEffect } from 'react';
import { JobApplication, InterviewSummary, AnswerPayload } from '@/lib/types-and-utils';
import { useInterviewEngine } from '@/lib/useInterviewEngine';

type InterviewContext = Pick<JobApplication, 'job_title' | 'company_name' | 'job_description' | 'language'>;

export default function LiveInterview({
  interviewContext,
  onInterviewComplete,
}: {
  interviewContext: InterviewContext; // <-- Gunakan tipe yang benar
  onInterviewComplete: (summary: InterviewSummary) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [interviewHistory, setInterviewHistory] = useState<AnswerPayload[]>([]);
  const [lastFeedback, setLastFeedback] = useState('');

  const {
    videoRef,
    initialize,
    isEngineReady,
    engineStatus,
    isListening,
    transcribedText,
    startAnswering,
    stopAnswering,
  } = useInterviewEngine();

  // Initialize engine on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Start interview and get first question once engine is ready
  useEffect(() => {
    if (!isEngineReady) return;
    const fetchFirstQuestion = async () => {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDetails: interviewContext, language: interviewContext.language }),
      });
      const data = await response.json();
      setCurrentQuestion(data.question);
      setIsLoading(false);
    };
    fetchFirstQuestion();
  }, [isEngineReady, interviewContext]);

  const handleToggleAnswer = async () => {
    if (!isListening) {
      startAnswering();
    } else {
      setIsLoading(true);
      const result = stopAnswering();
      if (!result) return;
      
      const payload: AnswerPayload = {
        question: currentQuestion,
        ...result,
      };

      const newHistory = [...interviewHistory, payload];
      setInterviewHistory(newHistory);

      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDetails: interviewContext,
          answerPayload: payload,
          history: interviewHistory,
          language: interviewContext.language, // <-- KIRIM BAHASA
        }),
      });
      const data = await response.json();
      
      setLastFeedback(data.feedback);

      if (data.nextQuestion === 'END_OF_INTERVIEW') {
        endInterview(newHistory);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setIsLoading(false);
      }
    }
  };

  const endInterview = async (finalHistory: AnswerPayload[]) => {
    const response = await fetch('/api/interview/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: finalHistory, 
        language: interviewContext.language // <-- KIRIM BAHASA
      }),
    });
    const summary = await response.json();
    onInterviewComplete(summary);
  };
  
  if (!isEngineReady) {
    return <div className="text-center p-8">{engineStatus}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom Kiri: UI Interaksi */}
        <div className="flex flex-col space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Interviewer AI</h3>
            <p className="text-blue-900 min-h-[60px]">{isLoading && !currentQuestion ? 'Preparing...' : isLoading ? 'Analyzing answer...' : currentQuestion}</p>
          </div>
          
          <div className="flex-grow p-4 bg-gray-50 border rounded-lg">
             <h3 className="font-bold text-gray-800 mb-2">Your Live Transcript</h3>
             <p className="text-gray-700 min-h-[120px]">{transcribedText}</p>
          </div>

          {lastFeedback && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800">Quick Feedback:</h4>
              <p className="text-sm text-green-700">{lastFeedback}</p>
            </div>
          )}

          <button
            onClick={handleToggleAnswer}
            disabled={isLoading || !isEngineReady}
            className={`w-full py-3 text-lg font-bold text-white rounded-lg transition-all ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isListening ? 'Stop & Submit Answer' : 'Start Answering'}
          </button>
        </div>
        
        {/* Kolom Kanan: Video Feed */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          {isListening && 
            <div className="absolute top-3 right-3 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>REC</span>
            </div>
          }
        </div>

      </div>
       <div className="text-center mt-6">
          <button onClick={() => endInterview(interviewHistory)} className="text-sm text-gray-500 hover:text-red-500">
            End Interview Manually
          </button>
        </div>
    </div>
  );
}