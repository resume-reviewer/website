"use client"

import { useState, useEffect, useMemo, type JSX, useCallback } from "react"
import Link from "next/link"
import type { JobApplication } from "@/lib/types-and-utils"
import JobCard from "@/components/jobs/JobCard"
import {
  FaThLarge,
  FaBrain,
  FaSearch,
  FaPlus,
  FaBookmark,
  FaPaperPlane,
  FaMicrophone,
  FaTrophy,
  FaTimes,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa"
import {
  FcLowPriority,
  FcMediumPriority,
  FcHighPriority,
} from "react-icons/fc"
import { useSession } from "next-auth/react"
import Sidebar from "@/components/layout/Sidebar"

const KANBAN_COLUMNS: {
  title: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected"
  icon: JSX.Element
  color: string
  bgColor: string
}[] = [
    {
      title: "Saved",
      icon: <FaBookmark />,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#7DD5DB] to-[#5BC5CA]",
    },
    {
      title: "Applied",
      icon: <FaPaperPlane />,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#6BA8D4] to-[#4A89C4]",
    },
    {
      title: "Interview",
      icon: <FaMicrophone />,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#8A7BD5] to-[#6A5AC4]",
    },
    {
      title: "Offer",
      icon: <FaTrophy />,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#7DD5A8] to-[#5BC587]",
    },
    {
      title: "Rejected",
      icon: <FaTimes />,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#D57D8A] to-[#C45B6A]",
    },
  ]

export default function JobTrackerPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [draggedJob, setDraggedJob] = useState<JobApplication | null>(null); // State untuk pekerjaan yang sedang di-drag

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch("/api/jobs")
        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const data = await response.json()
        setJobs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleStatusChange = useCallback((jobId: string, newStatus: JobApplication["status"]) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job)))
  }, [])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = selectedFilter === "all" || job.priority === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [jobs, searchTerm, selectedFilter])

  type KanbanStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  type Stats = Record<KanbanStatus, number> & {
    total: number;
    thisWeek: number;
    highPriority: number;
  };

  const stats = useMemo<Stats>(() => {
    const baseStats = KANBAN_COLUMNS.reduce(
      (acc, col) => {
        acc[col.title] = jobs.filter((job) => job.status === col.title).length;
        return acc;
      },
      {
        Saved: 0,
        Applied: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0,
      } as Record<KanbanStatus, number>,
    );

    return {
      ...baseStats,
      total: jobs.length,
      thisWeek: jobs.filter((job) => {
        const jobDate = new Date(job.created_at || "");
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return jobDate >= weekAgo;
      }).length,
      highPriority: jobs.filter((job) => job.priority === "high").length,
    };
  }, [jobs]);

  const priorityFilters = [
    { value: "all", label: "All Jobs", icon: <FaThLarge />, count: jobs.length },
    {
      value: "high",
      label: "High Priority",
      icon: <FcHighPriority />,
      count: jobs.filter((j) => j.priority === "high").length,
      color: "text-red-600",
    },
    {
      value: "medium",
      label: "Medium Priority",
      icon: <FcMediumPriority />,
      count: jobs.filter((j) => j.priority === "medium").length,
      color: "text-yellow-600",
    },
    {
      value: "low",
      label: "Low Priority",
      icon: <FcLowPriority />,
      count: jobs.filter((j) => j.priority === "low").length,
      color: "text-green-600",
    },
  ]

  // Handler untuk memulai drag
  const handleDragStart = (e: React.DragEvent, job: JobApplication) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", job.id!); // Kirim ID pekerjaan
  };

  // Handler untuk event drag over (memungkinkan drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Penting: mencegah perilaku default untuk memungkinkan drop
    e.dataTransfer.dropEffect = "move";
  };

  // Handler untuk drop
  const handleDrop = async (e: React.DragEvent, newStatus: JobApplication["status"]) => {
    e.preventDefault();
    if (!draggedJob) return;

    // Pastikan status yang di-drop berbeda dari status saat ini
    if (draggedJob.status === newStatus) {
      setDraggedJob(null);
      return;
    }

    setIsLoading(true); // Tampilkan loading saat update status
    setError("");

    try {
      const response = await fetch(`/api/jobs/${draggedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job status.");
      }

      // Update state lokal setelah sukses
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === draggedJob.id ? { ...job, status: newStatus } : job))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job status.");
      console.error("Error updating job status via drag-and-drop:", err);
    } finally {
      setIsLoading(false);
      setDraggedJob(null); // Reset dragged job
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                    <FaThLarge className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent"> {/* Changed text-3xl to text-2xl */}
                      Job Tracker
                    </h1>
                    <p className="text-slate-600 font-medium">Track and manage your job search progress</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7DD5DB] focus:border-transparent transition-all duration-300 w-full sm:w-80 placeholder-slate-400"
                    placeholder="Search jobs, companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Add Job Button */}
                <Link
                  href="/jobs/add"
                  className="flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group whitespace-nowrap"
                >
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                  Add Job
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="px-8 py-6 bg-white/40 backdrop-blur-sm border-b border-slate-200/50">
          <div className="flex flex-wrap gap-3">
            {priorityFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedFilter === filter.value
                    ? "bg-white shadow-lg border-2 border-[#7DD5DB] text-[#3B6597] scale-105"
                    : "bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white hover:shadow-md hover:-translate-y-1"
                  }`}
              >
                <span className={filter.color || "text-slate-600"}>{filter.icon}</span>
                {filter.label}
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
            {/* Main Stats */}
            {KANBAN_COLUMNS.map((column) => (
              <div
                key={column.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${column.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <span className={`text-xl mx-2 ${column.color}`}>{column.icon}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">{stats[column.title] || 0}</div>
                    <div className="text-sm font-semibold text-slate-600">{column.title}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Additional Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{stats.total}</div>
                  <div className="text-sm font-semibold text-slate-600">Total Jobs</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{stats.thisWeek}</div>
                  <div className="text-sm font-semibold text-slate-600">This Week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/jobs/add"
              className="group bg-gradient-to-br from-[#7DD5DB]/10 to-[#3B6597]/10 border border-[#7DD5DB]/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaPlus className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Add New Job</h3>
                  <p className="text-sm text-slate-600">Track a new opportunity</p>
                </div>
              </div>
            </Link>

            <Link
              href="/resume-reviewer"
              className="group bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaBrain className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">AI Resume Review</h3>
                  <p className="text-sm text-slate-600">Optimize your resume</p>
                </div>
              </div>
            </Link>

            <Link
              href="/interview"
              className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25f53e] to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaMicrophone className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Mock Interview</h3>
                  <p className="text-sm text-slate-600">Practice with AI</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced Kanban Board */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#7DD5DB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading your jobs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Jobs</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Application Pipeline</h2>
                <div className="text-sm text-slate-600">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {KANBAN_COLUMNS.map((column) => (
                  <div
                    key={column.title}
                    // Tambahkan event handler drag-and-drop ke setiap kolom
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.title)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg"
                  >
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${column.bgColor} flex items-center justify-center shadow-sm`}>
                            <span className={`${column.color} text-sm`}>{column.icon}</span>
                          </div>
                          <h3 className="font-bold text-slate-800">{column.title}</h3>
                        </div>
                        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
                          {filteredJobs.filter((j) => j.status === column.title).length}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-4 min-h-[500px]">
                      {filteredJobs
                        .filter((j) => j.status === column.title)
                        .map((job) => (
                          <JobCard 
                            key={job.id} 
                            job={job} 
                            onStatusChange={handleStatusChange} 
                            onDragStart={handleDragStart} // Teruskan prop onDragStart
                          />
                        ))}

                      {filteredJobs.filter((j) => j.status === column.title).length === 0 && (
                        <div className="text-center py-12">
                          <div className={`w-16 h-16 ${column.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md`}>
                            <span className={`${column.color} text-xl`}>{column.icon}</span>
                          </div>
                          <p className="text-slate-500 font-medium">No {column.title.toLowerCase()} jobs</p>
                          <p className="text-sm text-slate-400">Jobs will appear here when you add them</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}