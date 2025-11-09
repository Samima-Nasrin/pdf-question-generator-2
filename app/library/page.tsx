"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Trash2, Play } from "lucide-react"

export default function LibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questionSets, setQuestionSets] = useState<any[]>([])
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

      // Fetch question sets
      const { data, error } = await supabase
        .from("question_sets")
        .select("*")
        .eq("user_id", user.id)
        .order("generation_date", { ascending: false })

      if (!error && data) {
        setQuestionSets(data)
      }

      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question set?")) return

    const { error } = await supabase.from("question_sets").delete().eq("id", id)

    if (!error) {
      setQuestionSets(questionSets.filter((q) => q.id !== id))
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Question Library</h1>
          <p className="text-muted-foreground">Browse and manage all your generated question sets</p>
        </div>

        {questionSets.length === 0 ? (
          <Card className="p-12 text-center border-border/50">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No question sets yet</h3>
            <p className="text-muted-foreground mb-6">Generate your first question set to get started</p>
            <Link href="/generate">
              <Button>Generate Questions</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {questionSets.map((set) => (
              <Card key={set.id} className="p-6 border-border/50 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{set.pdf_name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Questions: {set.total_questions}</span>
                      <span>Difficulty: {set.difficulty}</span>
                      <span>Language: {set.language}</span>
                      <span>Generated: {new Date(set.generation_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/exam/${set.id}`}>
                      <Button size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Take Exam
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(set.id)} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
