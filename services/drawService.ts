import type { Database, Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type DrawRow = Tables<"draws">
type DrawMode = "random" | "algorithmic"

type CreateMonthlyDrawInput = {
  mode: DrawMode
  drawDate?: string
  jackpotRollover?: boolean
}

const DRAW_NUMBER_MIN = 1
const DRAW_NUMBER_MAX = 45
const DRAW_NUMBERS_COUNT = 5

function toIsoDateOnly(value: Date) {
  return value.toISOString().split("T")[0]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }

  return copy
}

function buildNumberPool() {
  return Array.from(
    { length: DRAW_NUMBER_MAX - DRAW_NUMBER_MIN + 1 },
    (_, index) => index + DRAW_NUMBER_MIN,
  )
}

function pickUniqueNumbersFromPool(pool: number[], count: number) {
  return shuffle(pool).slice(0, count).sort((a, b) => a - b)
}

export function generateRandomDrawNumbers(): number[] {
  return pickUniqueNumbersFromPool(buildNumberPool(), DRAW_NUMBERS_COUNT)
}

export async function generateAlgorithmicDrawNumbers(
  supabase: SupabaseServerClient,
): Promise<number[]> {
  const { data: scoreRows, error } = await supabase
    .from("scores")
    .select("score")
    .gte("score", DRAW_NUMBER_MIN)
    .lte("score", DRAW_NUMBER_MAX)

  if (error) {
    throw new Error(error.message)
  }

  const frequencyMap = new Map<number, number>()

  for (const row of scoreRows ?? []) {
    const score = row.score
    frequencyMap.set(score, (frequencyMap.get(score) ?? 0) + 1)
  }

  // If there is not enough score history yet, fall back to random generation.
  if (frequencyMap.size < DRAW_NUMBERS_COUNT) {
    return generateRandomDrawNumbers()
  }

  const weightedCandidates = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value)

  const topWeighted = weightedCandidates.slice(0, DRAW_NUMBERS_COUNT)

  // Mix weighted picks with random pool to avoid repetitive sequences.
  const randomCandidates = pickUniqueNumbersFromPool(
    buildNumberPool().filter((value) => !topWeighted.includes(value)),
    DRAW_NUMBERS_COUNT,
  )

  const merged = Array.from(new Set([...topWeighted.slice(0, 3), ...randomCandidates.slice(0, 2)]))

  if (merged.length < DRAW_NUMBERS_COUNT) {
    const missing = pickUniqueNumbersFromPool(
      buildNumberPool().filter((value) => !merged.includes(value)),
      DRAW_NUMBERS_COUNT - merged.length,
    )
    return [...merged, ...missing].sort((a, b) => a - b)
  }

  return merged.slice(0, DRAW_NUMBERS_COUNT).sort((a, b) => a - b)
}

export async function createMonthlyDraftDraw(
  supabase: SupabaseServerClient,
  input: CreateMonthlyDrawInput,
): Promise<DrawRow> {
  const drawDate = input.drawDate ?? toIsoDateOnly(new Date())

  const { data: existing, error: existingError } = await supabase
    .from("draws")
    .select("id")
    .eq("draw_date", drawDate)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    throw new Error("A draw already exists for this date")
  }

  const drawNumbers =
    input.mode === "algorithmic"
      ? await generateAlgorithmicDrawNumbers(supabase)
      : generateRandomDrawNumbers()

  const payload: Database["public"]["Tables"]["draws"]["Insert"] = {
    draw_numbers: drawNumbers,
    draw_date: drawDate,
    status: "draft",
    jackpot_rollover: input.jackpotRollover ?? false,
  }

  const { data, error } = await supabase
    .from("draws")
    .insert(payload)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create draw")
  }

  return data
}

export async function getRecentDraws(
  supabase: SupabaseServerClient,
  limit = 12,
): Promise<DrawRow[]> {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .order("draw_date", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function publishDraw(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<DrawRow> {
  const payload: Database["public"]["Tables"]["draws"]["Update"] = {
    status: "published",
  }

  const { data, error } = await supabase
    .from("draws")
    .update(payload)
    .eq("id", drawId)
    .select("*")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to publish draw")
  }

  return data
}
