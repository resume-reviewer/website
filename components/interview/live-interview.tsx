"use client"

import { useState, useEffect } from "react"
import type { JobApplication, InterviewSummary, AnswerPayload } from "@/lib/types-and-utils"
import { useInterviewEngine } from "@/lib/useInterviewEngine"
import {
  FaMicrophone,
  FaVideo,
  FaPlay,
  FaStop,
  FaSpinner,
  FaEye,
  FaVolumeUp,
  FaClock,
  FaChartLine,
  FaComments,
  FaBrain,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaLightbulb,
  FaHeartbeat,
} from "react-icons/fa"

type InterviewContext = Pick<JobApplication, "job_title" | "company_name" | "job_description" | "language">

interface LiveInterviewProps {
  interviewContext: InterviewContext
  onInterviewComplete: (summary: InterviewSummary) => void
}

export default function LiveInterview({ interviewContext, onInterviewComplete }: LiveInterviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [interviewHistory, setInterviewHistory] = useState<AnswerPayload[]>([])
  const [lastFeedback, setLastFeedback] = useState("")
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null)
  const [currentAnswerStartTime, setCurrentAnswerStartTime] = useState<Date | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)

  const {
    videoRef,
    initialize,
    isEngineReady,
    engineStatus,
    isListening,
    transcribedText,
    startAnswering,
    stopAnswering,
  } = useInterviewEngine()

  const mapContextToApiPayload = (context: InterviewContext) => ({
    jobTitle: context.job_title,
    jobDescription: context.job_description,
    companyName: context.company_name,
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isEngineReady || !interviewContext) return

    const fetchFirstQuestion = async () => {
      try {
        const apiPayload = mapContextToApiPayload(interviewContext)
        const response = await fetch("/api/interview/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDetails: apiPayload, language: interviewContext.language }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to start interview.")
        }
        setCurrentQuestion(data.question)
        setQuestionCount(1)
        setInterviewStartTime(new Date())
      } catch (error) {
        console.error("Error fetching first question:", error)
        setCurrentQuestion("Error: Could not load the first question. Please refresh and try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchFirstQuestion()
  }, [isEngineReady, interviewContext])

  const handleToggleAnswer = async () => {
    if (!isListening) {
      startAnswering()
      setCurrentAnswerStartTime(new Date())
    } else {
      setIsLoading(true)
      const result = stopAnswering()
      if (!result) {
        setIsLoading(false)
        return
      }

      const payload: AnswerPayload = {
        question: currentQuestion,
        ...result,
      }

      const newHistory = [...interviewHistory, payload]
      setInterviewHistory(newHistory)

      try {
        const apiPayload = mapContextToApiPayload(interviewContext)
        const response = await fetch("/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDetails: apiPayload,
            answerPayload: payload,
            history: interviewHistory,
            language: interviewContext.language,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to process answer.")
        }

        setLastFeedback(data.feedback)

        if (data.nextQuestion === "END_OF_INTERVIEW") {
          endInterview(newHistory)
        } else {
          setCurrentQuestion(data.nextQuestion)
          setQuestionCount((prev) => prev + 1)
          setCurrentAnswerStartTime(null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error submitting answer:", error)
        setLastFeedback(`Error: ${(error as Error).message}. You can end the interview manually.`)
        setCurrentQuestion("An error occurred. Please wait or end the interview.")
        setIsLoading(false)
      }
    }
  }

  const endInterview = async (finalHistory: AnswerPayload[]) => {
    setIsLoading(true)
    const response = await fetch("/api/interview/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: finalHistory,
        language: interviewContext.language,
      }),
    })
    const summary = await response.json()
    onInterviewComplete(summary)
  }

  const getElapsedTime = () => {
    if (!interviewStartTime) return "00:00"
    const now = new Date()
    const diff = Math.floor((now.getTime() - interviewStartTime.getTime()) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getCurrentAnswerTime = () => {
    if (!currentAnswerStartTime || !isListening) return "00:00"
    const now = new Date()
    const diff = Math.floor((now.getTime() - currentAnswerStartTime.getTime()) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  if (!isEngineReady) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-full flex items-center justify-center mx-auto mb-6">
            <FaSpinner className="text-white text-2xl animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Initializing Interview Engine</h2>
          <p className="text-slate-600 mb-6">{engineStatus}</p>
          <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Interview Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7DD5DB] to-[#3B6597] rounded-xl flex items-center justify-center">
              <FaBrain className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{interviewContext.job_title} Interview</h1>
              <p className="text-slate-600">
                {interviewContext.company_name && `${interviewContext.company_name} • `}
                Question {questionCount} • {getElapsedTime()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Metrics Toggle */}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200"
            >
              <FaChartLine className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{showMetrics ? "Hide" : "Show"} Metrics</span>
            </button>

            {/* End Interview */}
            <button
              onClick={() => endInterview(interviewHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
            >
              <FaTimes />
              <span className="text-sm font-medium">End Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Interview Content */}
        <div className="space-y-6">
          {/* Current Question */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaComments className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800 mb-2">Interviewer AI</h3>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  {isLoading && !currentQuestion ? (
                    <div className="flex items-center gap-3">
                      <FaSpinner className="animate-spin text-blue-600" />
                      <span className="text-blue-700">Preparing next question...</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-3">
                      <FaSpinner className="animate-spin text-blue-600" />
                      <span className="text-blue-700">Analyzing your answer...</span>
                    </div>
                  ) : (
                    <p className="text-blue-900 leading-relaxed">{currentQuestion}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaMicrophone className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Your Response</h3>
                  {isListening && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Recording • {getCurrentAnswerTime()}</span>
                    </div>
                  )}
                </div>
              </div>

              {isListening && (
                <div className="flex items-center gap-2">
                  <FaHeartbeat className="text-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600">LIVE</span>
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200 min-h-[120px]">
              {transcribedText ? (
                <p className="text-green-900 leading-relaxed">{transcribedText}</p>
              ) : (
                <p className="text-green-600 italic">
                  {isListening
                    ? "Listening... Start speaking to see your words appear here."
                    : 'Click "Start Answering" to begin recording your response.'}
                </p>
              )}
            </div>
          </div>

          {/* Quick Feedback */}
          {lastFeedback && (
            <div
              className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-6 ${
                lastFeedback.startsWith("Error:") ? "border-red-200" : "border-emerald-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    lastFeedback.startsWith("Error:")
                      ? "bg-gradient-to-br from-red-500 to-red-600"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  }`}
                >
                  {lastFeedback.startsWith("Error:") ? (
                    <FaExclamationTriangle className="text-white" />
                  ) : (
                    <FaLightbulb className="text-white" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-bold mb-2 ${
                      lastFeedback.startsWith("Error:") ? "text-red-800" : "text-emerald-800"
                    }`}
                  >
                    {lastFeedback.startsWith("Error:") ? "Error" : "Quick Feedback"}
                  </h4>
                  <p
                    className={`leading-relaxed ${
                      lastFeedback.startsWith("Error:") ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {lastFeedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Control Button */}
          <div className="text-center">
            <button
              onClick={handleToggleAnswer}
              disabled={isLoading || !isEngineReady}
              className={`
                inline-flex items-center gap-4 px-8 py-6 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isListening
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:-translate-y-2 hover:shadow-3xl"
                    : "bg-gradient-to-r from-[#7DD5DB] to-[#3B6597] hover:from-[#3B6597] hover:to-[#7DD5DB] text-white hover:-translate-y-2 hover:shadow-3xl"
                }
              `}
            >
              {isListening ? (
                <>
                  <FaStop className="text-2xl" />
                  Stop & Submit Answer
                </>
              ) : (
                <>
                  <FaPlay className="text-2xl" />
                  Start Answering
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Video & Metrics */}
        <div className="space-y-6">
          {/* Video Feed */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaVideo className="text-white" />
                </div>
                <h3 className="font-bold text-purple-800">Video Analysis</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Camera Active</span>
              </div>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />

              {/* Recording Indicator */}
              {isListening && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold">REC</span>
                </div>
              )}

              {/* Analysis Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3">
                  <div className="grid grid-cols-3 gap-4 text-white text-sm">
                    <div className="text-center">
                      <FaEye className="mx-auto mb-1" />
                      <div className="font-semibold">Eye Contact</div>
                      <div className="text-xs opacity-75">Tracking...</div>
                    </div>
                    <div className="text-center">
                      <FaVolumeUp className="mx-auto mb-1" />
                      <div className="font-semibold">Voice Level</div>
                      <div className="text-xs opacity-75">Monitoring...</div>
                    </div>
                    <div className="text-center">
                      <FaClock className="mx-auto mb-1" />
                      <div className="font-semibold">Speaking Pace</div>
                      <div className="text-xs opacity-75">Analyzing...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Metrics */}
          {showMetrics && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <FaChartLine className="text-white" />
                </div>
                <h3 className="font-bold text-orange-800">Performance Metrics</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-orange-800">Questions Answered</span>
                    <span className="font-bold text-orange-900">{interviewHistory.length}</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (interviewHistory.length / 5) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">Interview Progress</span>
                    <span className="font-bold text-blue-900">{Math.min(100, questionCount * 20)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, questionCount * 20)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-800 mb-1">{getElapsedTime()}</div>
                    <div className="text-sm text-green-600">Total Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FaLightbulb className="text-white" />
              </div>
              <h3 className="font-bold text-amber-800">Interview Tips</h3>
            </div>

            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Maintain eye contact with the camera</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Speak clearly and at a moderate pace</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Use the STAR method for behavioral questions</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Take a moment to think before answering</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
