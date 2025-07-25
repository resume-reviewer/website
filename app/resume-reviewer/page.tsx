"use client"

import { useState } from "react"
import ResumeReviewerForm from "@/components/resume-reviewer/form"
import AnalysisResult from "@/components/resume-reviewer/analysis-result"
import type { ResumeAnalysis } from "@/lib/types-and-utils"
import { FaBrain, FaRocket, FaFileAlt, FaChartLine, FaArrowLeft } from "react-icons/fa"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"

export default function ResumeReviewerPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleAnalysisComplete = (analysisResult: ResumeAnalysis) => {
    setAnalysis(analysisResult)
    setShowResults(true)
  }

  const handleStartOver = () => {
    setAnalysis(null)
    setShowResults(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <Sidebar />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] flex items-center justify-center shadow-lg">
                <FaBrain className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#3B6597] to-[#7DD5DB] bg-clip-text text-transparent">
                  AI Resume Reviewer
                </h1>
                <p className="text-sm text-slate-600">Optimize your resume with AI insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7DD5DB]/10 rounded-full blur-3xl -z-10"></div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">AI-Powered Analysis</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#3B6597] via-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                  Perfect Your Resume
                </span>
                <br />
                <span className="text-slate-800">Land More Interviews</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
                Get instant, personalized feedback on your resume tailored to specific job requirements. Our AI analyzes
                your resume and provides actionable insights to improve your chances.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">95%</div>
                  <div className="text-slate-600 font-medium">Accuracy Rate</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaRocket className="text-white text-xl" />
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">3x</div>
                  <div className="text-slate-600 font-medium">More Interviews</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">50K+</div>
                  <div className="text-slate-600 font-medium">Resumes Analyzed</div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                  How It{" "}
                  <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
                    Works
                  </span>
                </h2>
                <p className="text-xl text-slate-600">Three simple steps to optimize your resume</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="relative group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl font-black">1</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Job Details</h3>
                      <p className="text-slate-600 text-center leading-relaxed">
                        Provide information about the job you're applying for including title, company, and requirements
                      </p>
                    </div>
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] z-10"></div>
                </div>

                <div className="relative group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl font-black">2</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Upload Resume</h3>
                      <p className="text-slate-600 text-center leading-relaxed">
                        Upload your resume in PDF format for comprehensive AI analysis and text extraction
                      </p>
                    </div>
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] z-10"></div>
                </div>

                <div className="relative group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7DD5DB]/5 to-[#3B6597]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl font-black">3</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">Get Analysis</h3>
                      <p className="text-slate-600 text-center leading-relaxed">
                        Receive detailed feedback and improvement suggestions tailored to your target role
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
              <ResumeReviewerForm onAnalysisComplete={handleAnalysisComplete} />
            </div>
          </>
        ) : (
          analysis && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
              <AnalysisResult analysis={analysis} onStartOver={handleStartOver} />
            </div>
          )
        )}
      </div>
    </div>
  )
}
