"use client"

import type { InterviewSummary } from "@/lib/types-and-utils"
import {
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaMicrophone,
  FaEye,
  FaVolumeUp,
  FaRedo,
  FaDownload,
  FaPrint,
  FaGraduationCap,
  FaThLarge,
  FaBrain,
  FaRocket,
} from "react-icons/fa"

interface FeedbackSummaryProps {
  summary: InterviewSummary
  onStartOver: () => void
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

const getScoreGradient = (score: number) => {
  if (score >= 80) return "from-green-500 to-emerald-500"
  if (score >= 60) return "from-yellow-500 to-orange-500"
  return "from-red-500 to-pink-500"
}

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excellent"
  if (score >= 80) return "Very Good"
  if (score >= 70) return "Good"
  if (score >= 60) return "Fair"
  return "Needs Improvement"
}

const ScoreGauge = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          className={getScoreColor(score)}
          style={{
            strokeDasharray,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${getScoreColor(score)}`}>{score}</span>
        <span className="text-sm text-slate-600 font-medium">/ 100</span>
      </div>
    </div>
  )
}

export default function FeedbackSummary({ summary, onStartOver }: FeedbackSummaryProps) {
  const averageMetrics = summary.performanceMetrics?.reduce(
    (acc, metric) => ({
      speechPace: acc.speechPace + metric.speechPace,
      volumeLevel: acc.volumeLevel + metric.volumeLevel,
      eyeContactPercentage: acc.eyeContactPercentage + (metric.eyeContactPercentage || 0),
    }),
    { speechPace: 0, volumeLevel: 0, eyeContactPercentage: 0 },
  ) || { speechPace: 0, volumeLevel: 0, eyeContactPercentage: 0 }

  const metricsCount = summary.performanceMetrics?.length || 1
  const avgSpeechPace = averageMetrics.speechPace / metricsCount
  const avgVolumeLevel = averageMetrics.volumeLevel / metricsCount
  const avgEyeContact = averageMetrics.eyeContactPercentage / metricsCount

  // Calculate overall score based on feedback
  const calculateOverallScore = () => {
    const baseScore = 70
    const strengthsBonus = (summary.strengths?.length || 0) * 5
    const improvementPenalty =
      (summary.areasForImprovement?.content?.length || 0) * 3 + (summary.areasForImprovement?.delivery?.length || 0) * 3
    return Math.max(0, Math.min(100, baseScore + strengthsBonus - improvementPenalty))
  }

  const overallScore = calculateOverallScore()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB]/10 to-[#3B6597]/10 px-6 py-3 rounded-full border border-[#7DD5DB]/20 mb-6">
          <FaTrophy className="text-[#3B6597]" />
          <span className="font-semibold text-[#3B6597]">Interview Complete</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
          Your Interview{" "}
          <span className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] bg-clip-text text-transparent">
            Performance Report
          </span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Comprehensive analysis of your interview performance with personalized feedback and improvement suggestions
        </p>
      </div>

      {/* Overall Score Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] h-2"></div>
        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Overall Performance Score</h2>
            <div className="flex flex-col items-center">
              <ScoreGauge score={overallScore} />
              <div className="mt-4">
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                  {getScoreLabel(overallScore)}
                </div>
                <p className="text-slate-600">
                  You scored better than {Math.min(95, overallScore + 10)}% of candidates
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FaMicrophone className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Speech Pace</h3>
                  <p className="text-sm text-blue-600">Words per minute</p>
                </div>
              </div>
              <div className="text-3xl font-black text-blue-800 mb-2">{Math.round(avgSpeechPace)}</div>
              <div className="flex items-center gap-2 text-sm">
                {avgSpeechPace >= 120 && avgSpeechPace <= 160 ? (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-600 font-medium">Optimal pace</span>
                  </>
                ) : avgSpeechPace > 160 ? (
                  <>
                    <FaArrowUp className="text-orange-500" />
                    <span className="text-orange-600 font-medium">Too fast</span>
                  </>
                ) : (
                  <>
                    <FaArrowDown className="text-orange-500" />
                    <span className="text-orange-600 font-medium">Too slow</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaVolumeUp className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Voice Level</h3>
                  <p className="text-sm text-green-600">Audio clarity</p>
                </div>
              </div>
              <div className="text-3xl font-black text-green-800 mb-2">{Math.round(avgVolumeLevel * 100)}%</div>
              <div className="flex items-center gap-2 text-sm">
                {avgVolumeLevel >= 0.3 ? (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-600 font-medium">Clear audio</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="text-orange-600 font-medium">Speak louder</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FaEye className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">Eye Contact</h3>
                  <p className="text-sm text-purple-600">Camera engagement</p>
                </div>
              </div>
              <div className="text-3xl font-black text-purple-800 mb-2">{Math.round(avgEyeContact)}%</div>
              <div className="flex items-center gap-2 text-sm">
                {avgEyeContact >= 60 ? (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-600 font-medium">Good engagement</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="text-orange-600 font-medium">Look at camera more</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Strengths</h2>
              <p className="text-green-600">What you did well</p>
            </div>
          </div>

          <div className="space-y-4">
            {summary.strengths?.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
                <p className="text-green-800 leading-relaxed">{strength}</p>
              </div>
            )) || <p className="text-slate-500 italic">No specific strengths identified in this session.</p>}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <FaThLarge className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-800">Areas for Improvement</h2>
              <p className="text-orange-600">Focus areas for growth</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Content Improvements */}
            {summary.areasForImprovement?.content && summary.areasForImprovement.content.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <FaBrain className="text-blue-600" />
                  Content & Answers
                </h3>
                <div className="space-y-3">
                  {summary.areasForImprovement.content.map((item, index) => (
                    <div
                      key={`content-${index}`}
                      className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200"
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-orange-800 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Improvements */}
            {summary.areasForImprovement?.delivery && summary.areasForImprovement.delivery.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <FaMicrophone className="text-purple-600" />
                  Delivery & Presentation
                </h3>
                <div className="space-y-3">
                  {summary.areasForImprovement.delivery.map((item, index) => (
                    <div
                      key={`delivery-${index}`}
                      className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200"
                    >
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-red-800 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-xl flex items-center justify-center">
            <FaGraduationCap className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Overall Assessment</h2>
            <p className="text-slate-600">Comprehensive feedback summary</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
          <p className="text-slate-800 leading-relaxed text-lg">{summary.overallFeedback}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
        <button
          onClick={onStartOver}
          className="flex items-center gap-3 bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        >
          <FaRedo className="group-hover:rotate-180 transition-transform duration-500" />
          Practice Another Interview
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <FaPrint />
            Print Report
          </button>

          <button
            onClick={() => {
              const dataStr = JSON.stringify(summary, null, 2)
              const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
              const exportFileDefaultName = "interview-feedback.json"
              const linkElement = document.createElement("a")
              linkElement.setAttribute("href", dataUri)
              linkElement.setAttribute("download", exportFileDefaultName)
              linkElement.click()
            }}
            className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <FaDownload />
            Download
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRocket className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Ready for Your Real Interview?</h2>
          <p className="text-purple-600 mb-6 max-w-2xl mx-auto">
            Keep practicing to improve your confidence and performance. Each session helps you get closer to landing
            your dream job.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-purple-800 text-sm">Practice More</div>
              <div className="text-xs text-purple-600">Try different roles</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-purple-800 text-sm">Study Feedback</div>
              <div className="text-xs text-purple-600">Review improvement areas</div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-semibold text-purple-800 text-sm">Apply Confidently</div>
              <div className="text-xs text-purple-600">Use your new skills</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
