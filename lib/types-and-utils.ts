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

// Validation utilities
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

// Formatting utilities
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

// Text processing utilities
export const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};
