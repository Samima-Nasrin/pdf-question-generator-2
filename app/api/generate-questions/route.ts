import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    console.log("[v0] API route called")

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const questionTypes = JSON.parse(formData.get("questionTypes") as string)
    const difficulty = formData.get("difficulty") as string
    const language = formData.get("language") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, "Size:", file.size)

    // Generate mock questions based on selected types
    const mockQuestions = []

    if (questionTypes.mcq) {
      mockQuestions.push(
        {
          type: "mcq",
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
          difficulty: difficulty,
          marks: 2,
        },
        {
          type: "mcq",
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: "Mars",
          difficulty: difficulty,
          marks: 2,
        },
      )
    }

    if (questionTypes.shortAnswer) {
      mockQuestions.push({
        type: "shortAnswer",
        question: "Explain the water cycle in 2-3 sentences.",
        correctAnswer: "Sample answer about evaporation, condensation, and precipitation",
        difficulty: difficulty,
        marks: 3,
      })
    }

    if (questionTypes.longAnswer) {
      mockQuestions.push({
        type: "longAnswer",
        question: "Discuss the impact of climate change on global ecosystems.",
        correctAnswer: "Sample detailed answer about climate change effects",
        difficulty: difficulty,
        marks: 5,
      })
    }

    if (questionTypes.caseStudy) {
      mockQuestions.push({
        type: "caseStudy",
        question: "Analyze the given business scenario and propose solutions.",
        context: "Sample business case study scenario",
        correctAnswer: "Sample analysis and solutions",
        difficulty: difficulty,
        marks: 10,
      })
    }

    // Save to database
    const { data, error } = await supabase
      .from("question_sets")
      .insert({
        user_id: user.id,
        pdf_hash: `mock-${Date.now()}`,
        pdf_name: file.name,
        questions_text: JSON.stringify(mockQuestions),
        questions_json: mockQuestions,
        language: language,
        difficulty: difficulty,
        total_questions: mockQuestions.length,
        file_size: file.size,
      })
      .select()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 })
    }

    console.log("[v0] Questions saved successfully")

    return NextResponse.json({
      success: true,
      totalQuestions: mockQuestions.length,
      questionSetId: data[0].id,
      message: "Demo mode: Sample questions generated",
    })
  } catch (error: any) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
