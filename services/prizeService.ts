import type { Database, Tables } from "@/types/database"

import { calculateDrawMatches } from "@/services/matchService"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type DrawRow = Tables<"draws">
type WinnerInsert = Database["public"]["Tables"]["winners"]["Insert"]
type WinnerStatus = Database["public"]["Enums"]["winner_status"]

type PrizeDistributionResult = {
  drawId: string
  activeSubscribers: number
  totalPool: number
  rolloverCarryIn: number
  tier5Pool: number
  tier4Pool: number
  tier3Pool: number
  tier5Winners: number
  tier4Winners: number
  tier3Winners: number
  tier5PrizePerWinner: number
  tier4PrizePerWinner: number
  tier3PrizePerWinner: number
  jackpotRolledOver: boolean
  winnersCreated: number
}

type PrizeBreakdown = Omit<PrizeDistributionResult, "drawId" | "winnersCreated">

const POOL_SPLIT = {
  tier5: 0.4,
  tier4: 0.35,
  tier3: 0.25,
} as const

const DEFAULT_SUBSCRIPTION_POOL_VALUE = 29
const POOL_PERCENTAGE_PER_SUBSCRIPTION = 0.5

function toMoney(value: number) {
  return Number(value.toFixed(2))
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

async function getActiveSubscriberCount(
  supabase: SupabaseServerClient,
): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("subscription_status", "active")

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

function calculatePrizeBreakdown(
  activeSubscribers: number,
  matchResult: Awaited<ReturnType<typeof calculateDrawMatches>>,
  rolloverCarryIn: number,
): PrizeBreakdown {
  const basePool = toMoney(
    activeSubscribers * DEFAULT_SUBSCRIPTION_POOL_VALUE * POOL_PERCENTAGE_PER_SUBSCRIPTION,
  )

  const totalPool = toMoney(basePool + rolloverCarryIn)

  const tier4Pool = toMoney(basePool * POOL_SPLIT.tier4)
  const tier3Pool = toMoney(basePool * POOL_SPLIT.tier3)
  const tier5BasePool = toMoney(basePool * POOL_SPLIT.tier5)
  const tier5Pool = toMoney(tier5BasePool + rolloverCarryIn)

  const tier5Winners = matchResult.tier5.length
  const tier4Winners = matchResult.tier4.length
  const tier3Winners = matchResult.tier3.length

  const tier5PrizePerWinner = tier5Winners > 0 ? toMoney(tier5Pool / tier5Winners) : 0
  const tier4PrizePerWinner = tier4Winners > 0 ? toMoney(tier4Pool / tier4Winners) : 0
  const tier3PrizePerWinner = tier3Winners > 0 ? toMoney(tier3Pool / tier3Winners) : 0

  const jackpotRolledOver = tier5Winners === 0

  return {
    activeSubscribers,
    totalPool,
    rolloverCarryIn,
    tier5Pool,
    tier4Pool,
    tier3Pool,
    tier5Winners,
    tier4Winners,
    tier3Winners,
    tier5PrizePerWinner,
    tier4PrizePerWinner,
    tier3PrizePerWinner,
    jackpotRolledOver,
  }
}

async function clearExistingWinners(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<void> {
  const { error } = await supabase.from("winners").delete().eq("draw_id", drawId)

  if (error) {
    throw new Error(error.message)
  }
}

async function insertWinners(
  supabase: SupabaseServerClient,
  winners: WinnerInsert[],
): Promise<void> {
  if (winners.length === 0) {
    return
  }

  const { error } = await supabase.from("winners").insert(winners)

  if (error) {
    throw new Error(error.message)
  }
}

export async function distributeDrawPrizes(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<PrizeDistributionResult> {
  const draw = await getDrawById(supabase, drawId)
  const matchResult = await calculateDrawMatches(supabase, drawId)
  const activeSubscribers = await getActiveSubscriberCount(supabase)
  const breakdown = calculatePrizeBreakdown(activeSubscribers, matchResult, draw.rollover_amount ?? 0)

  const winnerRows: WinnerInsert[] = [
    ...matchResult.tier5.map((winner) => ({
      user_id: winner.userId,
      draw_id: drawId,
      match_count: 5,
      prize_amount: breakdown.tier5PrizePerWinner,
      status: "pending" as WinnerStatus,
    })),
    ...matchResult.tier4.map((winner) => ({
      user_id: winner.userId,
      draw_id: drawId,
      match_count: 4,
      prize_amount: breakdown.tier4PrizePerWinner,
      status: "pending" as WinnerStatus,
    })),
    ...matchResult.tier3.map((winner) => ({
      user_id: winner.userId,
      draw_id: drawId,
      match_count: 3,
      prize_amount: breakdown.tier3PrizePerWinner,
      status: "pending" as WinnerStatus,
    })),
  ]

  await clearExistingWinners(supabase, drawId)
  await insertWinners(supabase, winnerRows)

  const drawUpdate: Database["public"]["Tables"]["draws"]["Update"] = {
    jackpot_rollover: breakdown.jackpotRolledOver,
    rollover_amount: breakdown.jackpotRolledOver ? breakdown.tier5Pool : 0,
  }

  const { error: drawUpdateError } = await supabase
    .from("draws")
    .update(drawUpdate)
    .eq("id", draw.id)

  if (drawUpdateError) {
    throw new Error(drawUpdateError.message)
  }

  return {
    drawId: draw.id,
    ...breakdown,
    winnersCreated: winnerRows.length,
  }
}

export async function simulateDrawPrizes(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<PrizeDistributionResult> {
  const draw = await getDrawById(supabase, drawId)
  const matchResult = await calculateDrawMatches(supabase, drawId)
  const activeSubscribers = await getActiveSubscriberCount(supabase)
  const breakdown = calculatePrizeBreakdown(activeSubscribers, matchResult, draw.rollover_amount ?? 0)

  return {
    drawId: draw.id,
    ...breakdown,
    winnersCreated: breakdown.tier3Winners + breakdown.tier4Winners + breakdown.tier5Winners,
  }
}
