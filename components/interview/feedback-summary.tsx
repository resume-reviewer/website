'use client';

import { InterviewSummary } from '@/lib/types-and-utils';

interface FeedbackSummaryProps {
  summary: InterviewSummary;
  onStartOver: () => void;
}

export default function FeedbackSummary({ summary, onStartOver }: FeedbackSummaryProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Interview Feedback</h2>

      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Overall Feedback</h3>
        <p className="text-blue-700 leading-relaxed">{summary.overallFeedback}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-3">Strengths</h3>
          <ul className="list-disc list-inside space-y-2 text-green-700">
            {summary.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-xl font-semibold text-red-800 mb-3">Areas for Improvement</h3>

          <h4 className="font-medium text-red-700 mt-2 mb-1">Content:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {summary.areasForImprovement.content.map((item, index) => (
              <li key={`content-${index}`}>{item}</li>
            ))}
          </ul>

          <h4 className="font-medium text-red-700 mt-4 mb-1">Delivery:</h4>
          <ul className="list-disc list-inside space-y-1 text-red-700">
            {summary.areasForImprovement.delivery.map((item, index) => (
              <li key={`delivery-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Try Another Interview
        </button>
      </div>
    </div>
  );
}