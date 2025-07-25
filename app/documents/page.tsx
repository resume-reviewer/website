"use client"

import { useState, useEffect, useCallback } from "react"
import Sidebar from "@/components/layout/Sidebar"
import {
  FaFilePdf,
  FaDownload,
  FaSpinner,
  FaFolder,
  FaFileAlt,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaSearch,
  FaFilter,
  FaTrash,
  FaEye,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa"
import { format } from "date-fns"
import type { UserDocument, JobApplication } from "@/lib/types-and-utils"

interface DocumentWithJob extends UserDocument {
  job?: JobApplication
}

interface GroupedDocuments {
  [key: string]: {
    job?: JobApplication
    documents: DocumentWithJob[]
  }
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case "resume":
      return <FaFileAlt className="text-blue-500" />
    case "diploma":
      return <FaGraduationCap className="text-green-500" />
    case "portfolio":
      return <FaBriefcase className="text-purple-500" />
    case "references":
      return <FaUsers className="text-orange-500" />
    default:
      return <FaFilePdf className="text-red-500" />
  }
}

const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    case "resume":
      return "Resume / CV"
    case "diploma":
      return "Diploma / Certificate"
    case "portfolio":
      return "Portfolio"
    case "references":
      return "References"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

const DocumentDownloader = ({ doc }: { doc: DocumentWithJob }) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Debug: Log the file path being used
      console.log("Attempting to download file with path:", doc.file_path)
      
      // Use the documents API to get signed URL with proper authentication
      const response = await fetch(`/api/documents/${doc.id}/download`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Download API error:", errorData)
        alert(errorData.error || "Could not generate download link. Please try again.")
        return
      }
      
      const { downloadUrl } = await response.json()
      
      if (downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = doc.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert("No download URL received. Please try again.")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
      title="Download"
    >
      {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
    </button>
  )
}

const DocumentItem = ({ doc, onDelete }: { doc: DocumentWithJob; onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(doc.id)
      } else {
        alert("Failed to delete document")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete document")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl">{getDocumentIcon(doc.document_type)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{doc.file_name}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span className="bg-slate-100 px-2 py-1 rounded-full">{getDocumentTypeLabel(doc.document_type)}</span>
              <span>
                <FaCalendarAlt className="inline mr-1" />
                {format(new Date(doc.created_at), "dd MMM yyyy")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DocumentDownloader doc={doc} />
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
          </button>
        </div>
      </div>
    </div>
  )
}

const JobGroup = ({
  jobTitle,
  jobData,
  onDeleteDocument,
}: {
  jobTitle: string
  jobData: { job?: JobApplication; documents: DocumentWithJob[] }
  onDeleteDocument: (id: string) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-gradient-to-r from-slate-50 to-cyan-50 rounded-xl border border-slate-200 overflow-hidden">
      <div
        className="p-6 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
              {jobData.job ? (
                <FaBuilding className="text-white text-xl" />
              ) : (
                <FaFolder className="text-white text-xl" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {jobData.job ? `${jobData.job.job_title} at ${jobData.job.company_name}` : jobTitle}
              </h3>
              <p className="text-sm text-slate-600">
                {jobData.documents.length} document{jobData.documents.length !== 1 ? "s" : ""}
                {jobData.job && (
                  <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs">{jobData.job.status}</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            <FaEye className={`transform transition-transform ${isExpanded ? "rotate-0" : "rotate-180"}`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid gap-3">
            {jobData.documents.map((doc) => (
              <DocumentItem key={doc.id} doc={doc} onDelete={onDeleteDocument} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped")

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/documents-with-jobs")
      if (!res.ok) throw new Error("Failed to fetch documents")
      const data = await res.json()
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
  }

  // Filter and search documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.job?.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.job?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || doc.document_type === filterType

    return matchesSearch && matchesFilter
  })

  // Group documents by job
  const groupedDocuments: GroupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const key = doc.job_id || "unassigned"
    const groupTitle = doc.job ? `${doc.job.job_title} at ${doc.job.company_name}` : "General Documents"

    if (!acc[key]) {
      acc[key] = {
        job: doc.job,
        documents: [],
      }
    }
    acc[key].documents.push(doc)
    return acc
  }, {} as GroupedDocuments)

  const documentTypes = ["all", "resume", "diploma", "portfolio", "references"]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                    <FaFolder className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                      Document Library
                    </h1>
                    <p className="text-slate-600 font-medium">
                      {documents.length} documents organized by jobs and categories
                    </p>
                  </div>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "grouped" ? "bg-[#7DD5DB] text-white" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <FaFolder className="inline mr-2" />
                  Grouped
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "list" ? "bg-[#7DD5DB] text-white" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <FaFileAlt className="inline mr-2" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents, jobs, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#7DD5DB] focus:ring-2 focus:ring-[#7DD5DB]/20 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:border-[#7DD5DB] focus:ring-2 focus:ring-[#7DD5DB]/20 outline-none transition-all bg-white"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : getDocumentTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center p-12">
              <div className="text-center">
                <FaSpinner className="animate-spin text-3xl text-[#7DD5DB] mx-auto mb-4" />
                <p className="text-slate-600">Loading your documents...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {filteredDocuments.length > 0 ? (
                <div className="space-y-6">
                  {viewMode === "grouped" ? (
                    // Grouped View
                    Object.entries(groupedDocuments).map(([key, jobData]) => {
                      const jobTitle = jobData.job
                        ? `${jobData.job.job_title} at ${jobData.job.company_name}`
                        : "General Documents"

                      return (
                        <JobGroup
                          key={key}
                          jobTitle={jobTitle}
                          jobData={jobData}
                          onDeleteDocument={handleDeleteDocument}
                        />
                      )
                    })
                  ) : (
                    // List View
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">All Documents</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid gap-4">
                          {filteredDocuments.map((doc) => (
                            <DocumentItem key={doc.id} doc={doc} onDelete={handleDeleteDocument} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Empty State
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <FaFolder className="text-3xl text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || filterType !== "all" ? "No documents found" : "No documents yet"}
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Upload documents when adding job applications to get started."}
                  </p>
                  {(searchTerm || filterType !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setFilterType("all")
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
