"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react"

export default function GeneratePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    shortAnswer: true,
    longAnswer: false,
    caseStudy: false,
  })
  const [difficulty, setDifficulty] = useState("medium")
  const [language, setLanguage] = useState("English")
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const router = useRouter()
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
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setStatus({ type: null, message: "" })
    }
  }

  const handleGenerate = async () => {
    if (!file) {
      setStatus({ type: "error", message: "Please select a PDF file" })
      return
    }

    setGenerating(true)
    setStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("questionTypes", JSON.stringify(questionTypes))
      formData.append("difficulty", difficulty)
      formData.append("language", language)

      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions")
      }

      setStatus({
        type: "success",
        message: `Successfully generated ${data.totalQuestions} questions!`,
      })

      setTimeout(() => {
        router.push("/library")
      }, 2000)
    } catch (err: any) {
      console.error("Error:", err)
      setStatus({
        type: "error",
        message: err.message || "Failed to generate questions. Please try again.",
      })
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Generate Questions</h1>
          <p className="text-muted-foreground">
            Upload a PDF to generate sample questions (demo mode - questions are not extracted from PDF content)
          </p>
        </div>

        <Card className="p-8 border-border/50">
          <div className="space-y-6">
            {/* Status Messages */}
            {status.type && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-3">Upload PDF</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">{file ? file.name : "Click to upload or drag and drop"}</p>
                  <p className="text-sm text-muted-foreground">
                    PDF files only • Demo: Sample questions will be generated
                  </p>
                </label>
              </div>
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-sm font-medium mb-3">Question Types</label>
              <div className="space-y-2">
                {[
                  { key: "mcq", label: "Multiple Choice Questions" },
                  { key: "shortAnswer", label: "Short Answer" },
                  { key: "longAnswer", label: "Long Answer" },
                  { key: "caseStudy", label: "Case Study" },
                ].map((type) => (
                  <label key={type.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={questionTypes[type.key as keyof typeof questionTypes]}
                      onChange={(e) =>
                        setQuestionTypes({
                          ...questionTypes,
                          [type.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-input"
                      disabled={generating}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-3">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={generating}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-3">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={generating}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerate} disabled={generating || !file} className="w-full gap-2" size="lg">
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                "Generate Sample Questions"
              )}
            </Button>

            {generating && (
              <p className="text-sm text-muted-foreground text-center">
                This may take 10-30 seconds depending on PDF size...
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
