import type { Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type DrawRow = Tables<"draws">
type ScoreRow = Tables<"scores">
type ProfileRow = Tables<"profiles">

type WinnerCandidate = {
  userId: string
  email: string
  drawId: string
  drawNumbers: number[]
  userNumbers: number[]
  matchedNumbers: number[]
  matchCount: 3 | 4 | 5
}

type MatchCalculationResult = {
  drawId: string
  processedUsers: number
  eligibleUsers: number
  nonQualifiedUsers: number
  tier3: WinnerCandidate[]
  tier4: WinnerCandidate[]
  tier5: WinnerCandidate[]
}

function toUniqueSorted(values: number[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

function getMatchedNumbers(userNumbers: number[], drawNumbers: number[]) {
  const drawSet = new Set(drawNumbers)
  return toUniqueSorted(userNumbers.filter((value) => drawSet.has(value)))
}

async function getDrawById(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<DrawRow> {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Draw not found")
  }

  return data
}

async function getActiveProfiles(
  supabase: SupabaseServerClient,
): Promise<Pick<ProfileRow, "id" | "email">[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("subscription_status", "active")

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function getLatestScoresByUser(
  supabase: SupabaseServerClient,
  userIds: string[],
): Promise<Map<string, ScoreRow[]>> {
  if (userIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .in("user_id", userIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const byUser = new Map<string, ScoreRow[]>()

  for (const score of data ?? []) {
    const existing = byUser.get(score.user_id) ?? []

    // Keep only latest five per user for deterministic matching.
    if (existing.length < 5) {
      existing.push(score)
      byUser.set(score.user_id, existing)
    }
  }

  return byUser
}

export async function calculateDrawMatches(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<MatchCalculationResult> {
  const draw = await getDrawById(supabase, drawId)
  const activeProfiles = await getActiveProfiles(supabase)
  const profileIds = activeProfiles.map((profile) => profile.id)
  const latestScoresByUser = await getLatestScoresByUser(supabase, profileIds)

  const tier3: WinnerCandidate[] = []
  const tier4: WinnerCandidate[] = []
  const tier5: WinnerCandidate[] = []

  let eligibleUsers = 0
  let nonQualifiedUsers = 0

  for (const profile of activeProfiles) {
    const scores = latestScoresByUser.get(profile.id) ?? []

    // Users are eligible only when they have full last 5 scores.
    if (scores.length < 5) {
      continue
    }

    eligibleUsers += 1

    const userNumbers = toUniqueSorted(scores.map((item) => item.score))
    const matchedNumbers = getMatchedNumbers(userNumbers, draw.draw_numbers)
    const matchCount = matchedNumbers.length

    if (matchCount < 3) {
      nonQualifiedUsers += 1
      continue
    }

    const winner: WinnerCandidate = {
      userId: profile.id,
      email: profile.email,
      drawId: draw.id,
      drawNumbers: draw.draw_numbers,
      userNumbers,
      matchedNumbers,
      matchCount: matchCount as 3 | 4 | 5,
    }

    if (matchCount === 5) {
      tier5.push(winner)
    } else if (matchCount === 4) {
      tier4.push(winner)
    } else {
      tier3.push(winner)
    }
  }

  return {
    drawId: draw.id,
    processedUsers: activeProfiles.length,
    eligibleUsers,
    nonQualifiedUsers,
    tier3,
    tier4,
    tier5,
  }
}
