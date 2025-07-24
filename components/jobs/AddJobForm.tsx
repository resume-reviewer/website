// File: /components/jobs/AddJobForm.tsx
"use client"

import type React from "react"

import { useState, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import {
  FaCheck,
  FaMagic,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaSave,
  FaFileAlt,
  FaPlus,
  FaUpload,
  FaLink,
  FaRobot,
  FaFire,
  FaBolt,
  FaLeaf,
} from "react-icons/fa"
import type { JobApplication } from "@/lib/types-and-utils"

// Tipe untuk dokumen yang akan diunggah dalam flow ini
interface DocumentForUpload {
  id: string
  type: "resume" | "cover-letter" | "diploma" | "portfolio" | "references"
  label: string
  file?: File
  link?: string
  status: "pending" | "generating" | "uploading" | "completed"
}

export default function AddJobForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    job_url: "",
    company_name: "",
    job_title: "",
    location: "",
    application_deadline: "",
    salary: "",
    priority: "medium",
    job_description: "",
    notes: "",
  })

  const [documents, setDocuments] = useState<DocumentForUpload[]>([
    { id: "doc1", type: "resume", label: "Resume / CV", status: "pending" },
    { id: "doc2", type: "cover-letter", label: "Cover Letter", status: "pending" },
    { id: "doc3", type: "diploma", label: "Diploma / Certificate", status: "pending" },
    { id: "doc4", type: "portfolio", label: "Portfolio", status: "pending" },
    { id: "doc5", type: "references", label: "References", status: "pending" },
  ])

  const [isScraping, setIsScraping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePrioritySelect = (priority: "high" | "medium" | "low") => {
    setFormData((prev) => ({ ...prev, priority }))
  }

  const handleAutoFill = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!formData.job_url) return

    setIsScraping(true)
    setError("")

    try {
      const response = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.job_url }),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to fetch job data.")
      }
      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        job_title: data.jobTitle || prev.job_title,
        company_name: data.companyName || prev.company_name,
        location: data.location || prev.location,
        job_description: data.jobDescription || prev.job_description,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setIsScraping(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocuments((docs) => docs.map((doc) => (doc.id === docId ? { ...doc, file, status: "completed" } : doc)))
    }
  }

  const triggerFileInput = (docId: string) => {
    document.getElementById(`file-input-${docId}`)?.click()
  }

  const nextStep = () => {
    if (currentStep === 1 && (!formData.company_name || !formData.job_title)) {
      setError("Please fill in Company Name and Job Title.")
      return
    }
    setError("")
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => setCurrentStep((prev) => prev - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!jobResponse.ok) {
        throw new Error("Failed to save job details.")
      }
      const newJob = await jobResponse.json()
      const jobId = newJob.id

      for (const doc of documents) {
        if (doc.file) {
          const docFormData = new FormData()
          docFormData.append("file", doc.file)
          docFormData.append("documentType", doc.type)
          docFormData.append("job_id", jobId)

          await fetch("/api/documents", {
            method: "POST",
            body: docFormData,
          })
        }
      }

      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAnother = () => {
    setCurrentStep(1)
    setFormData({
      job_url: "",
      company_name: "",
      job_title: "",
      location: "",
      application_deadline: "",
      salary: "",
      priority: "medium",
      job_description: "",
      notes: "",
    })
    setDocuments([
      { id: "doc1", type: "resume", label: "Resume / CV", status: "pending" },
      { id: "doc2", type: "cover-letter", label: "Cover Letter", status: "pending" },
      { id: "doc3", type: "diploma", label: "Diploma / Certificate", status: "pending" },
      { id: "doc4", type: "portfolio", label: "Portfolio", status: "pending" },
      { id: "doc5", type: "references", label: "References", status: "pending" },
    ])
    setError("")
    setIsScraping(false)
    setIsSubmitting(false)
  }

  const priorityOptions = [
    {
      value: "high",
      label: "High Priority",
      icon: <FaFire />,
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50 border-red-200",
      textColor: "text-red-700",
    },
    {
      value: "medium",
      label: "Medium Priority",
      icon: <FaBolt />,
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-700",
    },
    {
      value: "low",
      label: "Low Priority",
      icon: <FaLeaf />,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-700",
    },
  ]

  return (
    <div className="form-container max-w-4xl mx-auto">
      {/* Enhanced Progress Steps */}
      <div className="progress-steps">
        <div className="progress-line" style={{ width: `${Math.min(100, ((currentStep - 1) / 2) * 100)}%` }}></div>
        {["Job Details", "Documents", "Review"].map((label, index) => {
          const step = index + 1
          return (
            <div
              key={step}
              className={`step ${currentStep === step ? "active" : ""} ${currentStep > step ? "completed" : ""}`}
            >
              <div className="step-circle">{currentStep > step ? <FaCheck /> : step}</div>
              <div className="step-label">{label}</div>
            </div>
          )
        })}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 1: Job Details */}
        <div className={`form-section ${currentStep === 1 ? "active" : ""}`}>
          <h2 className="section-title">Job Information</h2>
          <p className="section-subtitle">Start by pasting the job link for auto-fill, or fill manually.</p>

          {/* Enhanced URL Input */}
          <div className="relative mb-8">
            <div className="flex gap-3">
              <input
                type="url"
                name="job_url"
                value={formData.job_url}
                onChange={handleInputChange}
                className="form-input flex-1"
                placeholder="Paste job URL (LinkedIn, Indeed, etc.)"
              />
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                onClick={handleAutoFill}
                disabled={isScraping || !formData.job_url}
              >
                {isScraping ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                {isScraping ? "Extracting..." : "Auto Fill"}
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Job Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Jakarta, Indonesia"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-grid single">
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>
          </div>

          {/* Enhanced Priority Selection */}
          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handlePrioritySelect(option.value as "high" | "medium" | "low")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.priority === option.value
                      ? `${option.bgColor} border-current ${option.textColor} scale-105 shadow-lg`
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${option.color} text-white flex items-center justify-center`}
                    >
                      {option.icon}
                    </div>
                    <span className="font-semibold text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid single">
            <div className="form-group">
              <label className="form-label">Job Description Highlights</label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleInputChange}
                className="form-textarea"
                rows={6}
                placeholder="Key requirements, responsibilities, and qualifications..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Step 2: Documents */}
        <div className={`form-section ${currentStep === 2 ? "active" : ""}`}>
          <h2 className="section-title">Required Documents</h2>
          <p className="section-subtitle">Upload the documents needed for this application.</p>

          <div className="bg-gradient-to-br from-slate-50 to-cyan-50 border border-slate-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center">
                <FaFileAlt className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Document Checklist</h3>
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        doc.status === "completed" ? "bg-green-500 border-green-500 text-white" : "border-slate-300"
                      }`}
                    >
                      {doc.status === "completed" && <FaCheck className="text-xs" />}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{doc.label}</span>
                      {doc.type === "resume" && <span className="text-red-500 ml-1">*</span>}
                      {doc.file && <p className="text-sm text-slate-500 mt-1">{doc.file.name}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="file"
                      id={`file-input-${doc.id}`}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, doc.id)}
                      accept=".pdf,.doc,.docx,.txt"
                    />

                    {doc.type === "cover-letter" ? (
                      <button
                        type="button"
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <FaMagic /> Generate with AI
                      </button>
                    ) : doc.type === "portfolio" ? (
                      <button
                        type="button"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <FaLink /> Add Link
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                          doc.file
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white hover:-translate-y-1 hover:shadow-lg"
                        }`}
                        onClick={() => triggerFileInput(doc.id)}
                      >
                        {doc.file ? <FaCheck /> : <FaUpload />}
                        {doc.file ? "Uploaded" : "Upload"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-grid single">
            <div className="form-group">
              <label className="form-label">Notes & HR Contact</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                rows={4}
                placeholder="Add notes about the recruiter, application process, or any other relevant information..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Step 3: Review */}
        <div className={`form-section ${currentStep === 3 ? "active" : ""}`}>
          <h2 className="section-title">Review & Confirm</h2>
          <p className="section-subtitle">Review your job details and available AI tools.</p>

          {/* AI Tools Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI Tools Available</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-purple-100">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-sm text-slate-700">Resume Match Review</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-purple-100">
                <div className="text-2xl mb-2">✍️</div>
                <div className="font-semibold text-sm text-slate-700">Cover Letter Generator</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-purple-100">
                <div className="text-2xl mb-2">🎤</div>
                <div className="font-semibold text-sm text-slate-700">Mock Interview</div>
              </div>
            </div>
          </div>

          {/* Job Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Job Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Company</div>
                <div className="text-lg font-semibold text-slate-800">{formData.company_name || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Position</div>
                <div className="text-lg font-semibold text-slate-800">{formData.job_title || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Location</div>
                <div className="text-lg font-semibold text-slate-800">{formData.location || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Priority</div>
                <div className="flex items-center gap-2">
                  {priorityOptions.find((p) => p.value === formData.priority)?.icon}
                  <span className="text-lg font-semibold text-slate-800 capitalize">{formData.priority}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-center font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Step 4: Success */}
        <div className={`form-section ${currentStep === 4 ? "active" : ""}`}>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <FaCheck className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Job Added Successfully!</h2>
            <p className="text-lg text-slate-600 mb-8">Your job and documents have been added to the tracker.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" className="nav-btn btn-secondary" onClick={addAnother}>
                <FaPlus /> Add Another Job
              </button>
              <button type="button" className="nav-btn btn-primary" onClick={() => router.push("/dashboard")}>
                View in Tracker
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="form-navigation">
          <button
            type="button"
            className="nav-btn btn-secondary"
            onClick={prevStep}
            style={{ visibility: currentStep > 1 ? "visible" : "hidden" }}
          >
            <FaArrowLeft /> Previous
          </button>
          {currentStep < 3 && (
            <button type="button" className="nav-btn btn-primary" onClick={nextStep}>
              Next <FaArrowRight />
            </button>
          )}
          {currentStep === 3 && (
            <button type="button" className="nav-btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Job
            </button>
          )}
        </div>
      )}
    </div>
  )
}
