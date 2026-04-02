import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type ScoreRow = Tables<"scores">

type ScoreWithUser = ScoreRow & {
  user_name: string
  user_email: string
}

type ScoreRecord = ScoreRow & {
  profiles: { name: string; email: string } | null
}

type AdminScoreUpdateInput = {
  score: number
  date: string
}

export async function getRecentScoresForAdmin(
  supabase: SupabaseServerClient,
  limit = 200,
): Promise<ScoreWithUser[]> {
  const { data, error } = await supabase
    .from("scores")
    .select(`
      id,
      user_id,
      score,
      date,
      created_at,
      profiles!scores_user_id_fkey(name, email)
    `)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as ScoreRecord[]

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    score: row.score,
    date: row.date,
    created_at: row.created_at,
    user_name: row.profiles?.name ?? "Unknown",
    user_email: row.profiles?.email ?? "Unknown",
  }))
}

export async function updateScoreByAdmin(
  supabase: SupabaseServerClient,
  scoreId: string,
  input: AdminScoreUpdateInput,
): Promise<ScoreRow> {
  const payload: Database["public"]["Tables"]["scores"]["Update"] = {
    score: input.score,
    date: input.date,
  }

  const { data, error } = await supabase
    .from("scores")
    .update(payload)
    .eq("id", scoreId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update score")
  }

  return data
}
