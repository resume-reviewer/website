"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { type JobDetails, type ResumeAnalysis } from "@/lib/types-and-utils"
import FileUpload from "./file-upload"
import {
  FaUpload,
  FaFilePdf,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaBrain,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLightbulb,
  FaMagic,
  FaChartLine,
  FaThLarge,
  FaCog,
} from "react-icons/fa"

interface ResumeReviewerFormProps {
  onAnalysisComplete: (analysis: ResumeAnalysis) => void
}

const EXPERIENCE_LEVELS = [
  { value: "Entry Level", label: "Entry Level", description: "0-2 years experience", icon: "🌱" },
  { value: "Mid Level", label: "Mid Level", description: "3-5 years experience", icon: "🚀" },
  { value: "Senior Level", label: "Senior Level", description: "6-10 years experience", icon: "⭐" },
  { value: "Lead/Principal", label: "Lead/Principal", description: "10+ years experience", icon: "👑" },
]

const POPULAR_INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Government",
]

export default function ResumeReviewerForm({ onAnalysisComplete }: ResumeReviewerFormProps) {
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    jobTitle: "",
    company: "",
    jobDescription: "",
    requiredSkills: "",
    experienceLevel: "",
    industry: "",
  })

  const [resumeText, setResumeText] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)

  const handleJobDetailsChange = useCallback(
    (field: keyof JobDetails, value: string) => {
      setJobDetails((prev) => ({ ...prev, [field]: value }))
      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [validationErrors],
  )

  // File upload handlers
  const handleFileProcessed = useCallback((text: string, fileName: string) => {
    setResumeText(text)
    setFileName(fileName)
    setError("")
  }, [])

  const handleFileError = useCallback((error: string) => {
    setError(error)
    setResumeText("")
    setFileName("")
  }, [])

  const validateStep = useCallback(
    (step: number): boolean => {
      const errors: Record<string, string> = {}

      if (step === 1) {
        if (!jobDetails.jobTitle.trim()) errors.jobTitle = "Job title is required"
        if (!jobDetails.company.trim()) errors.company = "Company name is required"
        if (!jobDetails.jobDescription.trim()) errors.jobDescription = "Job description is required"
        if (!jobDetails.experienceLevel) errors.experienceLevel = "Experience level is required"
        if (!jobDetails.industry.trim()) errors.industry = "Industry is required"
        if (!jobDetails.requiredSkills.trim()) errors.requiredSkills = "Required skills are required"
      }

      if (step === 2) {
        if (!resumeText.trim()) errors.resumeFile = "Resume file is required"
      }

      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [jobDetails, resumeText],
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateStep(1) || !validateStep(2)) {
      setError("Please fill in all required fields correctly")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDetails,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const { analysis } = await response.json()

      if (!analysis) {
        throw new Error("No analysis data received from server")
      }

      onAnalysisComplete(analysis)
    } catch (err) {
      console.error("Error analyzing resume:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze resume. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      setError("")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
    setError("")
  }

  const removeFile = () => {
    setResumeText("")
    setFileName("")
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <FaCog />
      case 2:
        return <FaUpload />
      default:
        return <FaCheck />
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStep - 1) / 1) * 100}%` }}
            />
          </div>

          {/* Step Indicators */}
          {[1, 2].map((step) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`
                w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-500 transform
                ${
                  currentStep >= step
                    ? "bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] border-[#7DD5DB] text-white shadow-lg scale-110"
                    : "bg-white border-slate-300 text-slate-400 shadow-md"
                }
              `}
              >
                {currentStep > step ? <FaCheck /> : getStepIcon(step)}
              </div>
              <div
                className={`
                mt-3 text-sm font-semibold transition-colors duration-300
                ${currentStep >= step ? "text-[#3B6597]" : "text-slate-400"}
              `}
              >
                {step === 1 ? "Job Details" : "Upload Resume"}
              </div>
              <div
                className={`
                text-xs transition-colors duration-300
                ${currentStep >= step ? "text-slate-600" : "text-slate-400"}
              `}
              >
                {step === 1 ? "Tell us about the role" : "Upload your resume"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Enhanced Job Details */}
        {currentStep === 1 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
                  <FaThLarge className="text-[#3B6597]" />
                  <span className="font-semibold text-[#3B6597]">Step 1: Job Information</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                  Tell Us About The{" "}
                  <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                    Perfect Role
                  </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Provide detailed information about the job you're applying for. The more specific you are, the better
                  our AI can tailor the analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Job Title */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FaThLarge className="text-[#3B6597]" />
                    Job Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={jobDetails.jobTitle}
                      onChange={(e) => handleJobDetailsChange("jobTitle", e.target.value)}
                      className={`
                        w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
                        ${
                          validationErrors.jobTitle
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
                        }
                        focus:outline-none focus:ring-4 placeholder-slate-400
                      `}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                    {validationErrors.jobTitle && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="text-xs" />
                        {validationErrors.jobTitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FaThLarge className="text-[#3B6597]" />
                    Company Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={jobDetails.company}
                      onChange={(e) => handleJobDetailsChange("company", e.target.value)}
                      className={`
                        w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
                        ${
                          validationErrors.company
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
                        }
                        focus:outline-none focus:ring-4 placeholder-slate-400
                      `}
                      placeholder="e.g., Google, Microsoft, Apple"
                    />
                    {validationErrors.company && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="text-xs" />
                        {validationErrors.company}
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FaChartLine className="text-[#3B6597]" />
                    Experience Level *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleJobDetailsChange("experienceLevel", level.value)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300 text-left
                          ${
                            jobDetails.experienceLevel === level.value
                              ? "border-[#7DD5DB] bg-gradient-to-br from-[#7DD5DB]/10 to-[#3B6597]/10 shadow-lg scale-105"
                              : "border-slate-200 bg-white/50 hover:border-slate-300 hover:shadow-md"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{level.icon}</span>
                          <span className="font-bold text-slate-800">{level.label}</span>
                        </div>
                        <p className="text-sm text-slate-600">{level.description}</p>
                      </button>
                    ))}
                  </div>
                  {validationErrors.experienceLevel && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <FaExclamationTriangle className="text-xs" />
                      {validationErrors.experienceLevel}
                    </div>
                  )}
                </div>

                {/* Industry */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <FaCog className="text-[#3B6597]" />
                    Industry *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={jobDetails.industry}
                      onChange={(e) => handleJobDetailsChange("industry", e.target.value)}
                      onFocus={() => setShowIndustryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
                      className={`
                        w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
                        ${
                          validationErrors.industry
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
                        }
                        focus:outline-none focus:ring-4 placeholder-slate-400
                      `}
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />

                    {showIndustryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-48 overflow-y-auto">
                        {POPULAR_INDUSTRIES.filter((industry) =>
                          industry.toLowerCase().includes(jobDetails.industry.toLowerCase()),
                        ).map((industry) => (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => {
                              handleJobDetailsChange("industry", industry)
                              setShowIndustryDropdown(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-[#7DD5DB]/10 hover:to-[#3B6597]/10 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    )}

                    {validationErrors.industry && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="text-xs" />
                        {validationErrors.industry}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mt-8 space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FaFileAlt className="text-[#3B6597]" />
                  Job Description *
                </label>
                <div className="relative">
                  <textarea
                    value={jobDetails.jobDescription}
                    onChange={(e) => handleJobDetailsChange("jobDescription", e.target.value)}
                    rows={6}
                    className={`
                      w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none
                      ${
                        validationErrors.jobDescription
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
                      }
                      focus:outline-none focus:ring-4 placeholder-slate-400
                    `}
                    placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any other relevant details..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {jobDetails.jobDescription.length} characters
                  </div>
                  {validationErrors.jobDescription && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                      <FaExclamationTriangle className="text-xs" />
                      {validationErrors.jobDescription}
                    </div>
                  )}
                </div>
              </div>

              {/* Required Skills */}
              <div className="mt-8 space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FaLightbulb className="text-[#3B6597]" />
                  Required Skills *
                </label>
                <div className="relative">
                  <textarea
                    value={jobDetails.requiredSkills}
                    onChange={(e) => handleJobDetailsChange("requiredSkills", e.target.value)}
                    rows={4}
                    className={`
                      w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none
                      ${
                        validationErrors.requiredSkills
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
                      }
                      focus:outline-none focus:ring-4 placeholder-slate-400
                    `}
                    placeholder="List the key technical and soft skills required for this position. Separate with commas or line breaks..."
                  />
                  {validationErrors.requiredSkills && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                      <FaExclamationTriangle className="text-xs" />
                      {validationErrors.requiredSkills}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-10 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaInfoCircle className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2">💡 Pro Tips for Better Analysis</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Copy the complete job posting for more accurate analysis</li>
                      <li>• Include specific technical requirements and qualifications</li>
                      <li>• Mention company culture and values if available</li>
                      <li>• Be specific about years of experience required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enhanced File Upload */}
        {currentStep === 2 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
                  <FaUpload className="text-[#3B6597]" />
                  <span className="font-semibold text-[#3B6597]">Step 2: Upload Resume</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                  Upload Your{" "}
                  <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                    Resume
                  </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Upload your resume in PDF or text format. Our AI will analyze it against the job requirements you
                  provided.
                </p>
              </div>

              {/* Enhanced File Upload Area */}
              <div className="max-w-2xl mx-auto">
                <FileUpload 
                  onFileProcessed={handleFileProcessed}
                  onError={handleFileError}
                />

                {resumeText && fileName && (
                  <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <FaFilePdf className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-green-800 text-lg">Resume uploaded successfully</h3>
                          <p className="text-green-600 text-sm">File ID: {fileName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <FaCheck className="text-green-500 text-sm" />
                            <span className="text-green-600 text-sm font-medium">Ready for analysis</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200 group"
                      >
                        <FaTimes className="text-red-500 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {validationErrors.resumeFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-red-500">
                    <FaExclamationTriangle />
                    <span>{validationErrors.resumeFile}</span>
                  </div>
                )}

                {/* File Format Info */}
                <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaInfoCircle className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-800 mb-2">📄 File Format Recommendations</h3>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>
                          • <strong>PDF:</strong> Most common format, good compatibility
                        </li>
                        <li>
                          • <strong>TXT:</strong> Best for accurate text extraction
                        </li>
                        <li>• Ensure your resume is well-formatted and readable</li>
                        <li>• Avoid image-heavy or complex layouts for better analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 mb-1">Analysis Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center pt-8">
          <button
            type="button"
            onClick={prevStep}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300
              ${
                currentStep > 1
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md hover:-translate-y-1"
                  : "invisible"
              }
            `}
            disabled={currentStep <= 1}
          >
            <FaArrowLeft />
            Previous
          </button>

          {currentStep < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              Next Step
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <FaMagic className="group-hover:rotate-12 transition-transform" />
                  Analyze Resume
                </>
              )}
            </button>
          )}
        </div>

        {/* Analysis Preview */}
        {currentStep === 2 && resumeText && !isAnalyzing && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBrain className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Ready for AI Analysis</h3>
              <p className="text-purple-600 mb-6">
                Our AI will analyze your resume against the job requirements and provide detailed feedback on:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="font-semibold text-purple-800">Skills Match</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold text-purple-800">Experience Fit</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-semibold text-purple-800">Improvements</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="font-semibold text-purple-800">Overall Score</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
