import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type ScoreRow = Tables<"scores">

type CreateScoreInput = {
  score: number
  date: string
}

export async function createScore(
  supabase: SupabaseServerClient,
  userId: string,
  input: CreateScoreInput,
): Promise<ScoreRow> {
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

  return data
}
