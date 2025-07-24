// File: /components/interview/feedback-summary.tsx

'use client';
import { InterviewSummary } from '@/lib/types-and-utils';

interface FeedbackSummaryProps {
  summary: InterviewSummary;
  onStartOver: () => void;
}

export default function FeedbackSummary({ summary, onStartOver }: FeedbackSummaryProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg border-t-4 border-indigo-500">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Interview Feedback</h2>

      <div className="mb-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-800 mb-3">Overall Feedback</h3>
        <p className="text-indigo-700 leading-relaxed">{summary.overallFeedback}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-3">Strengths</h3>
          <ul className="list-disc list-inside space-y-2 text-green-700">
            {summary.strengths?.map((strength, index) => <li key={index}>{strength}</li>)}
          </ul>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-xl font-semibold text-red-800 mb-3">Areas for Improvement</h3>
          <h4 className="font-medium text-red-700 mt-2 mb-1">Content:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {summary.areasForImprovement?.content?.map((item, index) => <li key={`content-${index}`}>{item}</li>)}
          </ul>
          <h4 className="font-medium text-red-700 mt-4 mb-1">Delivery:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {summary.areasForImprovement?.delivery?.map((item, index) => <li key={`delivery-${index}`}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className="text-center">
        <button onClick={onStartOver} className="add-job-btn">
          Try Another Interview
        </button>
      </div>
    </div>
  );
}