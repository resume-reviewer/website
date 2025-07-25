export interface JobDetails {
  jobTitle: string;
  company: string;
  jobDescription: string;
  requiredSkills: string;
  experienceLevel: string;
  industry: string;
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedbacks: Array<{
    category: string;
    feedback: string;
  }>;
  improvementSuggestions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const validateJobDetails = (jobDetails: JobDetails): string | null => {
  const required = [
    { field: 'jobTitle', label: 'Job Title' },
    { field: 'company', label: 'Company' },
    { field: 'jobDescription', label: 'Job Description' },
    { field: 'requiredSkills', label: 'Required Skills' },
    { field: 'experienceLevel', label: 'Experience Level' },
    { field: 'industry', label: 'Industry' }
  ];

  for (const { field, label } of required) {
    if (!jobDetails[field as keyof JobDetails]?.trim()) {
      return `${label} is required`;
    }
  }

  return null;
};

export const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'text/plain'];
  const allowedExtensions = ['.pdf', '.txt'];

  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

  if (!hasValidType && !hasValidExtension) {
    return 'Please upload a PDF or text file';
  }

  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
};

export const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') 
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export interface InterviewQuestion {
  question: string;
}

export interface RealTimeAnalysis {
  speechPace: number;
  volumeLevel: number; 
  eyeContactPercentage: number; 
  headMovement: number; 
}

export interface AnswerPayload {
  question: string;
  transcribedAnswer: string;
  analysis: RealTimeAnalysis;
}

export interface AnswerFeedback {
  feedback: string;
  nextQuestion: string;
}

export interface InterviewSummary {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: {
    content: string[];
    delivery: string[];
  };
  performanceMetrics: {
    question: string;
    speechPace: number;
    volumeLevel: number;
    eyeContactPercentage: number;
  }[];
}

export interface JobApplication {
  id?: string;
  user_id?: string;
  job_title: string; 
  company_name: string; 
  location: string;
  job_url: string;
  job_description: string;
  notes: string;
  application_deadline: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'; 
  created_at?: string;
  language?: 'en' | 'id';
  priority?: 'high' | 'medium' | 'low';
  salary?: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  job_id?: string; // job_id bisa null
  file_name: string;
  file_path: string;
  document_type: string;
  created_at: string;
}