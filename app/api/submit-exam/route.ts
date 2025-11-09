import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { userId, answers } = body

    // Fetch questions from question_sets
    const { data: questionSets, error: qError } = await supabase
      .from("question_sets")
      .select("questions_json")
      .eq("user_id", userId)
      .limit(1)
      .single()

    if (qError) throw qError

    // Grade the exam (simplified for demo)
    const questions = questionSets.questions_json as any[]
    let score = 0

    answers.forEach((ans: any) => {
      const q = questions.find((q: any, index: number) => index === ans.questionIndex)
      if (q && q.correctAnswer === ans.userAnswer) {
        score += q.marks || 1
      }
    })

    // Save result
    const { error: insertError } = await supabase.from("exam_results").insert({
      user_id: userId,
      marks_obtained: score,
      total_questions: questions.length,
      exam_date: new Date().toISOString(),
    })

    if (insertError) throw insertError

    return NextResponse.json({ message: "Exam submitted", score })
  } catch (err: any) {
    console.error("Submit exam error:", err)
    return NextResponse.json({ error: "Failed to submit exam", details: err.message }, { status: 500 })
  }
}
