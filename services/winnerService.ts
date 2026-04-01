import type { Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type WinnerRow = Tables<"winners">

type WinnerWithContext = WinnerRow & {
  user_name: string
  user_email: string
  draw_date: string
  draw_status: string
}

type WinnerRecord = WinnerRow & {
  profiles: { name: string; email: string } | null
  draws: { draw_date: string; status: string } | null
}

export async function getRecentWinners(
  supabase: SupabaseServerClient,
  limit = 100,
): Promise<WinnerWithContext[]> {
  const { data, error } = await supabase
    .from("winners")
    .select(`
      id,
      user_id,
      draw_id,
      match_count,
      prize_amount,
      status,
      proof_url,
      created_at,
      profiles!winners_user_id_fkey(name, email),
      draws!winners_draw_id_fkey(draw_date, status)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as WinnerRecord[]

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    draw_id: row.draw_id,
    match_count: row.match_count,
    prize_amount: row.prize_amount,
    status: row.status,
    proof_url: row.proof_url,
    created_at: row.created_at,
    user_name: row.profiles?.name ?? "Unknown",
    user_email: row.profiles?.email ?? "Unknown",
    draw_date: row.draws?.draw_date ?? "N/A",
    draw_status: row.draws?.status ?? "unknown",
  }))
}
