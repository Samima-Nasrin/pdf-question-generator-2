"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ExamPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questionSet, setQuestionSet] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [showNameInput, setShowNameInput] = useState(true)
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)

      // Fetch question set
      const { data, error } = await supabase
        .from("question_sets")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (!error && data) {
        setQuestionSet(data)
      }

      setLoading(false)
    }
    checkAuth()
  }, [supabase, router, params.id])

  // Timer effect
  useEffect(() => {
    if (!showNameInput && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, showNameInput, submitted])

  const handleStartExam = () => {
    if (!studentName.trim()) {
      alert("Please enter your name")
      return
    }
    setShowNameInput(false)
  }

  const handleAnswerChange = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer,
    })
  }

  const handleSubmitExam = async () => {
    if (!confirm("Are you sure you want to submit the exam?")) return

    // Calculate results
    const questions = questionSet.questions_json.mcq || []
    let correctCount = 0
    let totalMarks = 0

    questions.forEach((q: any, idx: number) => {
      totalMarks += q.marks || 1
      if (answers[idx] === q.correctAnswer) {
        correctCount += q.marks || 1
      }
    })

    const percentage = (correctCount / totalMarks) * 100
    const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : "B"

    // Save exam result
    const { error } = await supabase.from("exam_results").insert({
      user_id: user.id,
      question_set_id: questionSet.id,
      student_name: studentName,
      total_questions: questions.length,
      total_marks: totalMarks,
      marks_obtained: correctCount,
      percentage,
      grade,
      time_taken: 3600 - timeLeft,
      answers_json: answers,
      evaluation_json: { correctCount, totalMarks },
    })

    if (!error) {
      setSubmitted(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Question set not found</h2>
          <Link href="/library">
            <Button>Back to Library</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-border/50">
          <h1 className="text-2xl font-bold mb-2">Start Exam</h1>
          <p className="text-muted-foreground mb-6">Enter your name to begin the exam</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyPress={(e) => e.key === "Enter" && handleStartExam()}
              />
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <strong>Exam Details:</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">Total Questions: {questionSet.total_questions}</p>
              <p className="text-sm text-muted-foreground">Time Limit: 1 hour</p>
            </div>

            <Button onClick={handleStartExam} className="w-full">
              Start Exam
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (submitted) {
    const questions = questionSet.questions_json.mcq || []
    let correctCount = 0
    let totalMarks = 0

    questions.forEach((q: any, idx: number) => {
      totalMarks += q.marks || 1
      if (answers[idx] === q.correctAnswer) {
        correctCount += q.marks || 1
      }
    })

    const percentage = (correctCount / totalMarks) * 100
    const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B+" : "B"

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-border/50 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Exam Submitted!</h1>

          <div className="space-y-4 my-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-3xl font-bold text-primary">{percentage.toFixed(1)}%</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                <p className="text-xs text-muted-foreground">Grade</p>
                <p className="text-xl font-bold text-secondary">{grade}</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground">Correct</p>
                <p className="text-xl font-bold text-accent">
                  {correctCount}/{totalMarks}
                </p>
              </div>
            </div>
          </div>

          <Link href="/library" className="w-full">
            <Button className="w-full">Back to Library</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const questions = questionSet.questions_json.mcq || []
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{studentName}</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
            <Button onClick={handleSubmitExam} variant="outline" size="sm">
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 border-border/50 mb-6">
          <h3 className="text-lg font-semibold mb-6">{question?.question}</h3>

          {question?.type === "MCQ" && (
            <div className="space-y-3">
              {question?.options?.map((option: string, idx: number) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-lg border border-input hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question?.type !== "MCQ" && (
            <textarea
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-32"
            />
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  idx === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : answers[idx]
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
