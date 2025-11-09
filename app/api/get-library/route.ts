import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's question sets
    const { data, error } = await supabase
      .from("question_sets")
      .select("id, pdf_name, total_questions, difficulty, language, generation_date")
      .eq("user_id", user.id)
      .order("generation_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ questionSets: data })
  } catch (err: any) {
    console.error("Get library error:", err)
    return NextResponse.json({ error: "Failed to fetch question library", details: err.message }, { status: 500 })
  }
}
