// File: /components/jobs/AddJobForm.tsx
"use client"

import type React from "react"

import { useState, type MouseEvent, useEffect } from "react" // Import useEffect
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
  FaBuilding, 
  FaCalendarAlt, 
  FaMoneyBillAlt, 
  FaFolder,
  FaMapMarkerAlt
} from "react-icons/fa"
import type { JobApplication } from "@/lib/types-and-utils"

// Tipe untuk dokumen yang akan diunggah dalam flow ini
interface DocumentForUpload {
  id: string
  type: "resume" | "diploma" | "portfolio" | "references"
  label: string
  file?: File
  link?: string
  status: "pending" | "generating" | "uploading" | "completed"
}

interface AddJobFormProps {
  initialData?: JobApplication; // Data awal untuk mode edit
  onFormSubmitSuccess?: (job: JobApplication) => void; // Callback setelah submit sukses
  isEditMode?: boolean; // Menandakan mode edit
}

export default function AddJobForm({ initialData, onFormSubmitSuccess, isEditMode = false }: AddJobFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<JobApplication>>(
    initialData || { // Gunakan initialData jika ada
      job_url: "",
      company_name: "",
      job_title: "",
      location: "",
      application_deadline: "",
      salary: "",
      priority: "medium",
      job_description: "",
      notes: "",
      status: 'Saved', // Default status for new job
    }
  );

  const [documents, setDocuments] = useState<DocumentForUpload[]>([
    { id: "doc1", type: "resume", label: "Resume / CV", status: "pending" },
    { id: "doc3", type: "diploma", label: "Diploma / Certificate", status: "pending" },
    { id: "doc4", type: "portfolio", label: "Portfolio", status: "pending" },
    { id: "doc5", type: "references", label: "References", status: "pending" },
  ]);

  const [isScraping, setIsScraping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Jika di mode edit, langsung ke step 3 (review) atau sesuaikan jika ada step documents terkait edit
  useEffect(() => {
    if (isEditMode && initialData) {
      setCurrentStep(3); // Langsung ke review jika mode edit
    }
  }, [isEditMode, initialData]);

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
      let jobResponse;
      let newJob;

      if (isEditMode && formData.id) {
        // Mode Edit: Gunakan PATCH
        jobResponse = await fetch(`/api/jobs/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Mode Add: Gunakan POST
        jobResponse = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!jobResponse.ok) {
        throw new Error("Failed to save job details.");
      }
      newJob = await jobResponse.json();
      const jobId = newJob.id;

      // Hanya upload dokumen baru/yang diubah jika tidak dalam mode edit yang melewatkan step dokumen
      // Atau bisa tambahkan logika upload/update dokumen di sini jika diinginkan
      if (!isEditMode) { // Hanya untuk penambahan job baru
        for (const doc of documents) {
          if (doc.file) {
            const docFormData = new FormData();
            docFormData.append("file", doc.file);
            docFormData.append("documentType", doc.type);
            docFormData.append("job_id", jobId);

            await fetch("/api/documents", {
              method: "POST",
              body: docFormData,
            });
          }
        }
      }

      // Panggil callback onFormSubmitSuccess jika ada (untuk parent component)
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(newJob);
      } else {
        setCurrentStep(4); // Lanjutkan ke halaman sukses jika bukan dari modal edit
      }
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
      status: 'Saved',
    })
    setDocuments([
      { id: "doc1", type: "resume", label: "Resume / CV", status: "pending" },
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

  const formInputStyle = "w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-[#7DD5DB] focus:ring-[#7DD5DB]/20 focus:outline-none focus:ring-4 placeholder-slate-400";
  const formLabelStyle = "flex items-center gap-2 text-sm font-bold text-slate-700 mb-3";

  return (
    <div className="form-container max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Enhanced Progress Steps - Sembunyikan di mode edit */}
      {!isEditMode && (
        <div className="px-8 pt-8 pb-6">
          <div className="relative flex justify-between items-center max-w-md mx-auto">
            {/* Progress Line Background */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>
            {/* Progress Line Active */}
            <div 
              className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] transition-all duration-500 -z-10"
              style={{ width: `${Math.min(100, ((currentStep - 1) / 2) * 100)}%` }}
            ></div>
            
            {["Job Details", "Documents", "Review"].map((label, index) => {
              const step = index + 1
              const isActive = currentStep === step
              const isCompleted = currentStep > step
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 bg-white z-10
                    ${isCompleted 
                      ? 'border-[#3B6597] bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white shadow-lg' 
                      : isActive 
                        ? 'border-[#7DD5DB] text-[#3B6597] shadow-lg scale-110' 
                        : 'border-slate-300 text-slate-500'
                    }
                  `}>
                    {isCompleted ? <FaCheck className="text-sm" /> : step}
                  </div>
                  <div className={`
                    text-xs font-semibold mt-2 text-center max-w-[80px] leading-tight
                    ${isActive || isCompleted ? 'text-[#3B6597]' : 'text-slate-500'}
                  `}>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="p-8 md:p-12">
        {/* Step 1: Job Details (or main form for edit mode) */}
        {(currentStep === 1 || isEditMode) && (
          <div className="form-section active"> {/* Selalu aktif di mode edit */}
            {!isEditMode && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
                  <FaFileAlt className="text-[#3B6597]" />
                  <span className="font-semibold text-[#3B6597]">Step 1: Job Information</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                  Tell Us About The{" "}
                  <span className="bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                    Perfect Role
                  </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Provide detailed information about the job you're applying for. The more specific you are, the better
                  our AI can tailor the analysis.
                </p>
              </div>
            )}
            {/* Form Fields - Ini akan ditampilkan baik di mode Add (Step 1) maupun Edit */}
            {isEditMode && <p className="text-lg text-slate-600 mb-6 text-center">Update details for this job application.</p>}

            <div className="relative mb-8">
              <div className="flex gap-3">
                <input
                  type="url"
                  name="job_url"
                  value={formData.job_url || ""}
                  onChange={handleInputChange}
                  className={formInputStyle}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className={formLabelStyle}>
                  <FaBuilding className="text-[#3B6597]" /> Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name || ""}
                  onChange={handleInputChange}
                  className={formInputStyle}
                  required
                />
              </div>
              <div className="form-group">
                <label className={formLabelStyle}>
                  <FaFileAlt className="text-[#3B6597]" /> Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title || ""}
                  onChange={handleInputChange}
                  className={formInputStyle}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="form-group">
                <label className={formLabelStyle}>
                  <FaMapMarkerAlt className="text-[#3B6597]" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className={formInputStyle}
                  placeholder="e.g., Jakarta, Indonesia"
                />
              </div>
              <div className="form-group">
                <label className={formLabelStyle}>
                  <FaCalendarAlt className="text-[#3B6597]" /> Application Deadline
                </label>
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline ? new Date(formData.application_deadline).toISOString().split('T')[0] : ''} // Format untuk input date
                  onChange={handleInputChange}
                  className={formInputStyle}
                />
              </div>
            </div>

            <div className="form-group mt-6">
              <label className={formLabelStyle}>
                <FaMoneyBillAlt className="text-[#3B6597]" /> Salary Range
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary || ""}
                onChange={handleInputChange}
                className={formInputStyle}
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>

            <div className="form-group mt-6">
              <label className={formLabelStyle}>
                Priority Level
              </label>
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

            <div className="form-group">
              <label className={formLabelStyle}>
                Job Description Highlights
              </label>
              <textarea
                name="job_description"
                value={formData.job_description || ""}
                onChange={handleInputChange}
                className={`${formInputStyle} resize-y h-32`}
                placeholder="Key requirements, responsibilities, and qualifications..."
              ></textarea>
            </div>
            <div className="form-group mt-6">
              <label className={formLabelStyle}>
                Notes & HR Contact
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                className={`${formInputStyle} resize-y h-32`}
                placeholder="Add notes about the recruiter, application process, or any other relevant information..."
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 2: Documents - Hanya ditampilkan jika tidak dalam mode edit */}
        {currentStep === 2 && !isEditMode && (
          <div className="form-section active">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
                <FaFolder className="text-[#3B6597]" />
                <span className="font-semibold text-[#3B6597]">Step 2: Required Documents</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                Upload Your{" "}
                <span className="bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                  Documents
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload the documents needed for this application.
              </p>
            </div>

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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review - Selalu aktif di mode edit, atau saat di step 3 pada mode Add */}
        {(currentStep === 3 || isEditMode) && (
          <div className="form-section active">
            {!isEditMode && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
                  <FaCheck className="text-[#3B6597]" />
                  <span className="font-semibold text-[#3B6597]">Step 3: Review & Confirm</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                  Review &{" "}
                  <span className="bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                    Confirm
                  </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Review your job details and available AI tools.
                </p>
              </div>
            )}

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
        )}

        {/* Step 4: Success - Hanya ditampilkan jika tidak dalam mode edit */}
        {currentStep === 4 && !isEditMode && (
          <div className="form-section active">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <FaCheck className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">{isEditMode ? "Job Updated Successfully!" : "Job Added Successfully!"}</h2>
              <p className="text-lg text-slate-600 mb-8">{isEditMode ? "Your job details have been updated." : "Your job and documents have been added to the tracker."}</p>
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
        )}
      </form>

      {/* Navigation Buttons */}
      {/* Sembunyikan navigasi step jika dalam mode edit atau sudah di step sukses */}
      {currentStep < 4 && !isEditMode && (
        <div className="form-navigation px-8 pb-8">
          <button
            type="button"
            className="nav-btn btn-secondary"
            onClick={prevStep}
            style={{ visibility: currentStep > 1 ? "visible" : "hidden" }}
          >
            <FaArrowLeft /> Previous
          </button>

          {currentStep < 3 ? (
            <button type="button" className="nav-btn btn-primary" onClick={nextStep}>
              Next <FaArrowRight />
            </button>
          ) : (
            <button type="button" className="nav-btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Job
            </button>
          )}
        </div>
      )}

      {/* Save Button for Edit Mode */}
      {isEditMode && (
        <div className="p-8 border-t border-slate-200 flex justify-end">
          <button type="button" className="nav-btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {isEditMode ? "Update Job" : "Save Job"}
          </button>
        </div>
      )}
    </div>
  )
}