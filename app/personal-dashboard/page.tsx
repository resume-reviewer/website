"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  FaChartLine,
  FaUser,
  FaTrophy,
  FaCalendarAlt,
  FaBriefcase,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaMicrophone,
  FaThLarge,
  FaLightbulb,
  FaRocket,
  FaMapMarkerAlt,
  FaBuilding,
  FaGraduationCap,
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaShare,
  FaFire,
  FaBolt,
  FaLeaf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner, // Tambahkan ikon spinner
  FaTimes, // Tambahkan ikon times untuk error
} from "react-icons/fa"
import Sidebar from "@/components/layout/Sidebar"

// Define interfaces for the dashboard data structure, similar to your API response
interface DashboardData {
  user: {
    name: string;
    email: string | null | undefined;
    joinDate: string;
    profileCompletion: number;
  };
  applications: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
  };
  topRoles: { role: string; count: number; percentage: number; trend: string }[];
  companies: { name: string; applications: number; status: string }[];
  locations: { city: string; count: number; percentage: number }[];
  activityTrend: { month: string; applications: number; interviews: number; offers: number }[];
  documentsCount: number; // New field
  // Hardcoded or simplified sections for now
  journey: {
    currentStage: string;
    progress: number;
    stages: { name: string; completed: boolean; date: string | null }[];
  };
  skills: {
    technical: { skill: string; level: number; inDemand: boolean }[];
    soft: { skill: string; level: number }[];
  };
  insights: { type: string; title: string; message: string; action: string }[];
  recommendations: {
    title: string;
    description: string;
    priority: string;
    estimatedImpact: string;
    action: string;
    link: string;
  }[];
}


// Placeholder for initial loading state or empty data
const EMPTY_DASHBOARD_DATA: DashboardData = {
  user: { name: "Guest", email: null, joinDate: new Date().toISOString().split('T')[0], profileCompletion: 0 },
  applications: { total: 0, thisMonth: 0, lastMonth: 0, thisWeek: 0, responseRate: 0, interviewRate: 0, offerRate: 0 },
  topRoles: [],
  companies: [],
  locations: [],
  activityTrend: [],
  documentsCount: 0,
  journey: {
    currentStage: "Getting Started",
    progress: 0,
    stages: [
      { name: "Profile Setup", completed: false, date: null },
      { name: "First Application", completed: false, date: null },
      { name: "Resume Optimization", completed: false, date: null },
      { name: "Interview Practice", completed: false, date: null },
      { name: "Active Networking", completed: false, date: null },
      { name: "Job Offer", completed: false, date: null },
    ],
  },
  skills: {
    technical: [],
    soft: [],
  },
  insights: [],
  recommendations: [],
};


const PRIORITY_COLORS = {
  high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: <FaFire className="text-red-500" /> },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: <FaBolt className="text-yellow-500" />,
  },
  low: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: <FaLeaf className="text-green-500" />,
  },
}

const INSIGHT_COLORS = {
  success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: <FaCheckCircle /> },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: <FaExclamationTriangle />,
  },
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: <FaInfoCircle /> },
}

export default function PersonalDashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA); // Gunakan state untuk data dashboard
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard-data');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setDashboardData(EMPTY_DASHBOARD_DATA); // Reset to empty on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-emerald-500"
    if (percentage >= 60) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-pink-500"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FaArrowUp className="text-green-500" />
      case "down":
        return <FaArrowDown className="text-red-500" />
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  // Calculate days on job search journey
  const daysOnJourney = Math.floor(
    (new Date().getTime() - new Date(dashboardData.user.joinDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#7DD5DB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your personal dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-red-600 text-xl" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-3 bg-[#7DD5DB] text-white rounded-xl font-bold hover:bg-[#3B6597] transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                      Personal Dashboard
                    </h1>
                    <p className="text-slate-600 font-medium">Your job search analytics and insights</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <FaShare />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <FaPrint />
                  <span className="text-sm font-medium">Print</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <FaDownload />
                  <span className="text-sm">Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">
                      Welcome back, {dashboardData.user.name.split(" ")[0]}! 👋
                    </h2>
                    <p className="text-slate-600 text-lg">
                      You've been on your job search journey for{" "}
                      {daysOnJourney}{" "}
                      days
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Active Job Seeker</span>
                      </div>
                      <div className="text-sm text-slate-500">Profile {dashboardData.user.profileCompletion}% complete</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#3B6597] mb-1">{dashboardData.applications.total}</div>
                    <div className="text-sm font-semibold text-slate-600">Total Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-green-600 mb-1">{dashboardData.applications.responseRate}%</div>
                    <div className="text-sm font-semibold text-slate-600">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-600 mb-1">{dashboardData.applications.offerRate}%</div>
                    <div className="text-sm font-semibold text-slate-600">Offer Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Progress (currently mostly hardcoded as per discussion) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Job Search Journey</h3>
                  <p className="text-slate-600">Track your progress towards landing your dream job</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-purple-600 mb-1">{dashboardData.journey.progress}%</div>
                <div className="text-sm font-semibold text-slate-600">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${dashboardData.journey.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Journey Stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardData.journey.stages.map((stage, index) => (
                <div
                  key={index}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    stage.completed
                      ? "bg-green-50 border-green-200 shadow-md"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        stage.completed
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {stage.completed ? <FaCheckCircle /> : <div className="w-3 h-3 bg-current rounded-full" />}
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${stage.completed ? "text-green-800" : "text-slate-600"}`}>
                      {stage.name}
                    </h4>
                    {stage.date && (
                      <p className="text-xs text-slate-500">{new Date(stage.date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Applications This Month */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBriefcase className="text-white text-xl" />
                </div>
                {/* Trend calculation is still simplified */}
                <div className="flex items-center gap-1 text-green-600">
                  <FaArrowUp className="text-sm" />
                  <span className="text-sm font-bold">{dashboardData.applications.lastMonth > 0 ? ((dashboardData.applications.thisMonth / dashboardData.applications.lastMonth * 100) - 100).toFixed(0) : '+1'}%</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-1">{dashboardData.applications.thisMonth}</div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Applications This Month</div>
              <div className="text-xs text-slate-500">vs {dashboardData.applications.lastMonth} last month</div>
            </div>

            {/* Interview Rate */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaMicrophone className="text-white text-xl" />
                </div>
                 {/* Trend calculation is still simplified */}
                <div className="flex items-center gap-1 text-green-600">
                  <FaArrowUp className="text-sm" />
                  <span className="text-sm font-bold">+5%</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-1">{dashboardData.applications.interviewRate}%</div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Interview Rate</div>
              <div className="text-xs text-slate-500">{dashboardData.applications.total} applications</div> {/* simplified */}
            </div>

            {/* Response Rate */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaEye className="text-white text-xl" />
                </div>
                 {/* Trend calculation is still simplified */}
                <div className="flex items-center gap-1 text-red-600">
                  <FaArrowDown className="text-sm" />
                  <span className="text-sm font-bold">-3%</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-1">{dashboardData.applications.responseRate}%</div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Response Rate</div>
              <div className="text-xs text-slate-500">{dashboardData.applications.total} applications</div> {/* simplified */}
            </div>

            {/* This Week */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                 {/* Trend calculation is still simplified */}
                <div className="flex items-center gap-1 text-green-600">
                  <FaArrowUp className="text-sm" />
                  <span className="text-sm font-bold">+2</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-1">{dashboardData.applications.thisWeek}</div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Applications This Week</div>
              <div className="text-xs text-slate-500">Keep up the momentum!</div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Roles */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-xl flex items-center justify-center">
                    <FaThLarge className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Top Applied Roles</h3>
                    <p className="text-slate-600 text-sm">Your most targeted positions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardData.topRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{role.role}</h4>
                        <p className="text-sm text-slate-600">{role.count} applications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{role.percentage}%</div>
                        <div className="text-xs text-slate-500">of total</div>
                      </div>
                      {getTrendIcon(role.trend)}
                    </div>
                  </div>
                ))}
                {dashboardData.topRoles.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No job roles recorded yet.</p>
                )}
              </div>
            </div>

            {/* Activity Trend */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Activity Trend</h3>
                    <p className="text-slate-600 text-sm">Monthly application progress</p>
                  </div>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {dashboardData.activityTrend.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">{month.month}</span>
                      <span className="text-sm text-slate-600">{month.applications} apps</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${(month.applications / Math.max(...dashboardData.activityTrend.map(a => a.applications), 1)) * 100}%` }}
                      ></div> {/* Dynamic width based on max applications */}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{month.interviews} interviews</span>
                      <span>{month.offers} offers</span>
                    </div>
                  </div>
                ))}
                 {dashboardData.activityTrend.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No application activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills Analysis (still hardcoded as per discussion) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Skills Analysis</h3>
                <p className="text-slate-600 text-sm">Your technical and soft skills assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technical Skills */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaRocket className="text-blue-600" />
                  Technical Skills
                </h4>
                <div className="space-y-4">
                  {dashboardData.skills.technical.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{skill.skill}</span>
                          {skill.inDemand && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              In Demand
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-600">{skill.level}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            skill.inDemand
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-blue-600"
                          }`}
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.skills.technical.length === 0 && (
                    <p className="text-slate-500">No technical skills data available.</p>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaUser className="text-purple-600" />
                  Soft Skills
                </h4>
                <div className="space-y-4">
                  {dashboardData.skills.soft.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">{skill.skill}</span>
                        <span className="text-sm font-bold text-slate-600">{skill.level}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.skills.soft.length === 0 && (
                    <p className="text-slate-500">No soft skills data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insights & Alerts (still hardcoded as per discussion) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FaLightbulb className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Smart Insights</h3>
                <p className="text-slate-600 text-sm">AI-powered analysis of your job search performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.insights.map((insight, index) => {
                const colors = INSIGHT_COLORS[insight.type as keyof typeof INSIGHT_COLORS]
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}`}
                      >
                        {colors.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold mb-2 ${colors.text}`}>{insight.title}</h4>
                        <p className={`text-sm mb-3 ${colors.text} opacity-80`}>{insight.message}</p>
                        <button className={`text-sm font-semibold ${colors.text} hover:underline`}>
                          {insight.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
               {dashboardData.insights.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-4">No insights available yet.</div>
              )}
            </div>
          </div>

          {/* Strategic Recommendations (still hardcoded as per discussion) */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-xl flex items-center justify-center">
                <FaTrophy className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Strategic Recommendations</h3>
                <p className="text-slate-600 text-sm">Personalized action items to boost your success rate</p>
              </div>
            </div>

            <div className="space-y-6">
              {dashboardData.recommendations.map((rec, index) => {
                const colors = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS]
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          {colors.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`font-bold ${colors.text}`}>{rec.title}</h4>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.bg} ${colors.text}`}
                            >
                              {rec.priority} Priority
                            </span>
                          </div>
                          <p className={`text-sm mb-3 ${colors.text} opacity-80`}>{rec.description}</p>
                          <div className="flex items-center gap-4">
                            <div className={`text-sm font-semibold ${colors.text}`}>
                              Expected Impact: {rec.estimatedImpact}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={rec.link}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${colors.text} ${colors.bg} border ${colors.border}`}
                      >
                        {rec.action}
                      </Link>
                    </div>
                  </div>
                )
              })}
              {dashboardData.recommendations.length === 0 && (
                <p className="text-center text-slate-500 py-4">No recommendations available yet.</p>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Companies */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Target Companies</h3>
                  <p className="text-slate-600 text-sm">Companies you've applied to</p>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardData.companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{company.name}</h4>
                        <p className="text-sm text-slate-600">{company.applications} applications</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        company.status === "Offer"
                          ? "bg-green-100 text-green-700"
                          : company.status === "Interview"
                            ? "bg-blue-100 text-blue-700"
                            : company.status === "Applied"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {company.status}
                    </span>
                  </div>
                ))}
                {dashboardData.companies.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No companies recorded yet.</p>
                )}
              </div>
            </div>

            {/* Location Preferences */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Location Distribution</h3>
                  <p className="text-slate-600 text-sm">Where you're applying</p>
                </div>
              </div>

              <div className="space-y-4">
                {dashboardData.locations.map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">{location.city}</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{location.count}</span>
                        <span className="text-sm text-slate-600 ml-2">({location.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-1000"
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {dashboardData.locations.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No locations recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}