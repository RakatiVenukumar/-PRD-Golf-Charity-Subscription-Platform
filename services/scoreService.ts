import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type ScoreRow = Tables<"scores">

type CreateScoreInput = {
  score: number
  date: string
}

type CreateScoreResult = {
  score: ScoreRow
  trimmedCount: number
}

async function enforceRollingScoresLimit(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<number> {
  const { data: scores, error: fetchError } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const staleScores = (scores ?? []).slice(5)

  if (staleScores.length === 0) {
    return 0
  }

  const staleIds = staleScores.map((item) => item.id)
  const { error: deleteError } = await supabase.from("scores").delete().in("id", staleIds)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  return staleIds.length
}

export async function createScore(
  supabase: SupabaseServerClient,
  userId: string,
  input: CreateScoreInput,
): Promise<CreateScoreResult> {
  const payload: Database["public"]["Tables"]["scores"]["Insert"] = {
    user_id: userId,
    score: input.score,
    date: input.date,
  }

  const { data, error } = await supabase
    .from("scores")
    .insert(payload)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to add score")
  }

  const trimmedCount = await enforceRollingScoresLimit(supabase, userId)

  return {
    score: data,
    trimmedCount,
  }
}
