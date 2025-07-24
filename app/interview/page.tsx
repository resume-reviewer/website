"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { JobApplication, InterviewSummary } from "@/lib/types-and-utils"
import { useSession } from "next-auth/react"
import {
  FaMicrophone,
  FaBrain,
  FaChartLine,
  FaArrowLeft,
  FaPlay,
  FaThLarge,
  FaVideo,
  FaHeadset,
  FaTrophy,
  FaClock,
} from "react-icons/fa"
import Sidebar from "@/components/layout/Sidebar"

// Definisikan tipe konteks di sini atau impor
type InterviewContext = Pick<JobApplication, "job_title" | "company_name" | "job_description" | "language">

const InterviewSetup = dynamic(() => import("@/components/interview/interview-setup"), { ssr: false })
const LiveInterview = dynamic(() => import("@/components/interview/live-interview"), { ssr: false })
const FeedbackSummary = dynamic(() => import("@/components/interview/feedback-summary"), { ssr: false })

type InterviewStage = "setup" | "live" | "feedback"

const INTERVIEW_FEATURES = [
  {
    icon: <FaBrain />,
    title: "AI-Powered Questions",
    description: "Dynamic questions tailored to your specific role and experience level",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: <FaVideo />,
    title: "Real-time Analysis",
    description: "Live feedback on your body language, eye contact, and speaking pace",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <FaChartLine />,
    title: "Performance Metrics",
    description: "Detailed analytics on your interview performance and areas for improvement",
    color: "from-green-500 to-green-600",
  },
  {
    icon: <FaHeadset />,
    title: "Voice Recognition",
    description: "Advanced speech-to-text technology for accurate answer transcription",
    color: "from-orange-500 to-orange-600",
  },
]

const SUCCESS_STATS = [
  { label: "Success Rate", value: "94%", description: "Users who improved after practice" },
  { label: "Average Score Increase", value: "+23%", description: "Performance improvement" },
  { label: "Practice Sessions", value: "50K+", description: "Completed interviews" },
  { label: "User Satisfaction", value: "4.9/5", description: "Average rating" },
]

export default function MockInterviewPage() {
  const { data: session } = useSession()
  const [stage, setStage] = useState<InterviewStage>("setup")
  const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null)
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null)

  const handleSetupComplete = (context: InterviewContext) => {
    setInterviewContext(context)
    setStage("live")
  }

  const handleInterviewComplete = (summary: InterviewSummary) => {
    setInterviewSummary(summary)
    setStage("feedback")
  }

  const handleStartOver = () => {
    setStage("setup")
    setInterviewContext(null)
    setInterviewSummary(null)
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
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-white hover:text-[#3B6597] hover:border-[#7DD5DB] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                    <FaMicrophone className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                      AI Mock Interview
                    </h1>
                    <p className="text-slate-600 font-medium">Practice with AI and get instant feedback</p>
                  </div>
                </div>
              </div>

              {/* Stage Indicator */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      stage === "setup" ? "bg-blue-500" : stage === "live" ? "bg-green-500" : "bg-purple-500"
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-700 capitalize">
                    {stage === "setup" ? "Setup" : stage === "live" ? "Live Interview" : "Results"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {stage === "setup" && (
            <div className="space-y-12">
              {/* Hero Section */}
              <div className="text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7DD5DB]/10 rounded-full blur-3xl -z-10"></div>

                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-600">AI-Powered Interview Practice</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-[#3B6597] via-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                    Master Your
                  </span>
                  <br />
                  <span className="text-slate-800">Next Interview</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
                  Practice with our AI interviewer that adapts to your role. Get real-time feedback on your answers,
                  body language, and speaking confidence.
                </p>

                {/* Quick Start Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                  <button
                    onClick={() => document.getElementById("interview-setup")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl group"
                  >
                    <FaPlay className="text-white group-hover:scale-110 transition-transform" />
                    Start Practice Interview
                  </button>

                  <div className="flex items-center gap-2 text-slate-600">
                    <FaClock className="text-[#3B6597]" />
                    <span className="text-sm font-medium">Takes 10-15 minutes</span>
                  </div>
                </div>

                {/* Success Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {SUCCESS_STATS.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="text-3xl font-black text-slate-800 mb-2">{stat.value}</div>
                      <div className="font-semibold text-slate-700 mb-1">{stat.label}</div>
                      <div className="text-sm text-slate-500">{stat.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 md:p-12 shadow-xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                    Why Choose Our{" "}
                    <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                      AI Interview Coach
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Advanced AI technology meets personalized coaching to give you the edge in your next interview
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {INTERVIEW_FEATURES.map((feature, index) => (
                    <div
                      key={index}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-white text-2xl">{feature.icon}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border border-purple-200 p-8 md:p-12">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                    How It{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Works
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600">Three simple steps to interview mastery</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      step: 1,
                      icon: <FaThLarge />,
                      title: "Setup Your Interview",
                      description:
                        "Choose your role, company, and interview language. Our AI will customize questions for your specific position.",
                    },
                    {
                      step: 2,
                      icon: <FaMicrophone />,
                      title: "Practice Live",
                      description:
                        "Answer questions while our AI analyzes your speech, body language, and eye contact in real-time.",
                    },
                    {
                      step: 3,
                      icon: <FaTrophy />,
                      title: "Get Detailed Feedback",
                      description:
                        "Receive comprehensive analysis with specific improvement suggestions and performance metrics.",
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-2xl font-black">{item.step}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">{item.title}</h3>
                          <p className="text-slate-600 text-center leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                      {/* Connector Line */}
                      {index < 2 && (
                        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 z-10"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup Component */}
              <div id="interview-setup">
                <InterviewSetup onSetupComplete={handleSetupComplete} />
              </div>
            </div>
          )}

          {stage === "live" && interviewContext && (
            <LiveInterview interviewContext={interviewContext} onInterviewComplete={handleInterviewComplete} />
          )}

          {stage === "feedback" && interviewSummary && (
            <FeedbackSummary summary={interviewSummary} onStartOver={handleStartOver} />
          )}
        </div>
      </main>
    </div>
  )
}
