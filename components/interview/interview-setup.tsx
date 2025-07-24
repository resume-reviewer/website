"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { JobApplication } from "@/lib/types-and-utils"
import {
  FaFlagUsa,
  FaGlobeAsia,
  FaRocket,
  FaBuilding,
  FaBriefcase,
  FaFileAlt,
  FaLightbulb,
  FaMagic,
  FaChevronRight,
  FaPlay,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLanguage,
} from "react-icons/fa"

// Tipe untuk konteks wawancara, yang merupakan bagian dari JobApplication
type InterviewContext = Pick<JobApplication, "job_title" | "company_name" | "job_description" | "language">

interface InterviewSetupProps {
  onSetupComplete: (context: InterviewContext) => void
}

const LANGUAGE_OPTIONS = [
  {
    code: "en",
    name: "English",
    flag: <FaFlagUsa className="text-red-600" />,
    description: "International standard",
    gradient: "from-blue-500 to-red-500",
  },
  {
    code: "id",
    name: "Bahasa Indonesia",
    flag: <FaGlobeAsia className="text-green-600" />,
    description: "Indonesian language",
    gradient: "from-red-500 to-white",
  },
]

const SAMPLE_JOBS = [
  {
    title: "Frontend Developer",
    company: "Tech Startup",
    description: "React, TypeScript, modern web development",
  },
  {
    title: "Product Manager",
    company: "SaaS Company",
    description: "Product strategy, user research, roadmap planning",
  },
  {
    title: "Data Scientist",
    company: "AI Company",
    description: "Machine learning, Python, data analysis",
  },
]

export default function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const [context, setContext] = useState<Omit<InterviewContext, "language">>({
    job_title: "",
    company_name: "",
    job_description: "",
  })
  const [language, setLanguage] = useState<"en" | "id">("en")
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSamples, setShowSamples] = useState(false)

  // Cek localStorage untuk data dari Job Tracker
  useEffect(() => {
    const savedContext = localStorage.getItem("interview_job_context")
    if (savedContext) {
      const parsedContext: Partial<JobApplication> = JSON.parse(savedContext)
      setContext({
        job_title: parsedContext.job_title || "",
        company_name: parsedContext.company_name || "",
        job_description: parsedContext.job_description || "",
      })
      localStorage.removeItem("interview_job_context")
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContext((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!context.job_title.trim()) {
      errors.job_title = "Job title is required"
    }

    if (!context.job_description.trim()) {
      errors.job_description = "Job description is required"
    } else if (context.job_description.trim().length < 50) {
      errors.job_description = "Please provide a more detailed job description (at least 50 characters)"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Please fill in all required fields correctly.")
      return
    }

    setIsValidating(true)
    setError("")

    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsValidating(false)
    onSetupComplete({ ...context, language })
  }

  const handleSampleSelect = (sample: (typeof SAMPLE_JOBS)[0]) => {
    setContext({
      job_title: sample.title,
      company_name: sample.company,
      job_description: sample.description,
    })
    setShowSamples(false)
  }

  const inputStyle = (fieldName: string) => `
    w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm
    ${
      validationErrors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
        : "border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20"
    }
    focus:outline-none focus:ring-4 placeholder-slate-400
  `

  const labelStyle = "flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
              <FaRocket className="text-[#3B6597]" />
              <span className="font-semibold text-[#3B6597]">Interview Setup</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Let's Prepare Your{" "}
              <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                Mock Interview
              </span>
            </h2>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Provide details about the role you're interviewing for. Our AI will create personalized questions and
              scenarios based on your input.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Language Selection */}
            <div className="space-y-4">
              <label className={labelStyle}>
                <FaLanguage className="text-[#3B6597]" />
                Interview Language *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLanguage(option.code as "en" | "id")}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden
                      ${
                        language === option.code
                          ? "border-[#7DD5DB] bg-gradient-to-br from-[#7DD5DB]/10 to-[#3B6597]/10 shadow-lg scale-105"
                          : "border-slate-200 bg-white/50 hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
                      }
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-3xl">{option.flag}</div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{option.name}</h3>
                          <p className="text-sm text-slate-600">{option.description}</p>
                        </div>
                      </div>
                      {language === option.code && (
                        <div className="flex items-center gap-2 text-[#3B6597] font-semibold">
                          <FaCheckCircle />
                          <span className="text-sm">Selected</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Samples */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaMagic className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800">Quick Start</h3>
                    <p className="text-sm text-blue-600">Try a sample interview setup</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSamples(!showSamples)}
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold transition-colors"
                >
                  <span className="text-sm">View Samples</span>
                  <FaChevronRight className={`transition-transform ${showSamples ? "rotate-90" : ""}`} />
                </button>
              </div>

              {showSamples && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {SAMPLE_JOBS.map((sample, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSampleSelect(sample)}
                      className="p-4 bg-white/80 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-left group"
                    >
                      <h4 className="font-semibold text-blue-800 mb-1 group-hover:text-blue-900">{sample.title}</h4>
                      <p className="text-sm text-blue-600 mb-2">{sample.company}</p>
                      <p className="text-xs text-blue-500">{sample.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="job_title" className={labelStyle}>
                  <FaBriefcase className="text-[#3B6597]" />
                  Job Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="job_title"
                    id="job_title"
                    value={context.job_title}
                    onChange={handleInputChange}
                    required
                    className={inputStyle("job_title")}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {validationErrors.job_title && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                      <FaExclamationTriangle className="text-xs" />
                      {validationErrors.job_title}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="company_name" className={labelStyle}>
                  <FaBuilding className="text-[#3B6597]" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  id="company_name"
                  value={context.company_name}
                  onChange={handleInputChange}
                  className={inputStyle("company_name")}
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="job_description" className={labelStyle}>
                <FaFileAlt className="text-[#3B6597]" />
                Job Description *
              </label>
              <div className="relative">
                <textarea
                  name="job_description"
                  id="job_description"
                  value={context.job_description}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className={`${inputStyle("job_description")} resize-none`}
                  placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any specific skills or technologies mentioned..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                  {context.job_description.length} characters
                </div>
                {validationErrors.job_description && (
                  <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                    <FaExclamationTriangle className="text-xs" />
                    {validationErrors.job_description}
                  </div>
                )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaLightbulb className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">💡 Tips for Better Interview Practice</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Include specific technologies, frameworks, or tools mentioned in the job posting</li>
                    <li>• Add details about team size, company culture, or project types if available</li>
                    <li>• Mention years of experience required and seniority level expectations</li>
                    <li>• Include any industry-specific requirements or certifications needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Setup Error</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isValidating}
                className="flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                {isValidating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    <FaPlay className="group-hover:scale-110 transition-transform" />
                    Start Mock Interview
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
