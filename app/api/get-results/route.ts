import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("exam_results")
      .select("*")
      .eq("user_id", userId)
      .order("exam_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ results: data })
  } catch (err: any) {
    console.error("Get results error:", err)
    return NextResponse.json({ error: "Failed to fetch results", details: err.message }, { status: 500 })
  }
}
