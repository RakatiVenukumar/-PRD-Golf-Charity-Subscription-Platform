"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { createMonthlyDraftDraw, publishDraw } from "@/services/drawService"
import { calculateDrawMatches } from "@/services/matchService"
import { sendDrawResultNotifications } from "@/services/notificationService"
import { distributeDrawPrizes, simulateDrawPrizes } from "@/services/prizeService"

const createDraftSchema = z.object({
  mode: z.enum(["random", "algorithmic"]),
  drawDate: z.union([z.iso.date(), z.literal(""), z.null()]).transform((value) => (value ? value : undefined)),
  jackpotRollover: z.boolean(),
})

const drawIdSchema = z.object({
  drawId: z.uuid("Invalid draw id"),
})

type DrawActionResult = {
  success: boolean
  error?: string
  message?: string
  summary?: {
    drawId: string
    tier5Winners: number
    tier4Winners: number
    tier3Winners: number
    totalPool: number
    rolloverCarryIn: number
    jackpotRolledOver: boolean
  }
}

async function getAuthorizedClient() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized")
  }

  return supabase
}

export async function createDraftDrawAction(
  input: z.input<typeof createDraftSchema>,
): Promise<DrawActionResult> {
  const parsed = createDraftSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    const draw = await createMonthlyDraftDraw(supabase, {
      mode: parsed.data.mode,
      drawDate: parsed.data.drawDate,
      jackpotRollover: parsed.data.jackpotRollover,
    })

    revalidatePath("/admin")

    return {
      success: true,
      message: `Draft draw created for ${draw.draw_date}.`,
      summary: {
        drawId: draw.id,
        tier5Winners: 0,
        tier4Winners: 0,
        tier3Winners: 0,
        totalPool: 0,
        rolloverCarryIn: draw.rollover_amount,
        jackpotRolledOver: draw.jackpot_rollover,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create draft draw" }
  }
}

export async function simulateDrawAction(
  input: z.input<typeof drawIdSchema>,
): Promise<DrawActionResult> {
  const parsed = drawIdSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    const matchResult = await calculateDrawMatches(supabase, parsed.data.drawId)
    const simulation = await simulateDrawPrizes(supabase, parsed.data.drawId)

    return {
      success: true,
      message: "Simulation complete.",
      summary: {
        drawId: simulation.drawId,
        tier5Winners: matchResult.tier5.length,
        tier4Winners: matchResult.tier4.length,
        tier3Winners: matchResult.tier3.length,
        totalPool: simulation.totalPool,
        rolloverCarryIn: simulation.rolloverCarryIn,
        jackpotRolledOver: simulation.jackpotRolledOver,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to simulate draw" }
  }
}

export async function executeDrawAction(
  input: z.input<typeof drawIdSchema>,
): Promise<DrawActionResult> {
  const parsed = drawIdSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    const supabase = await getAuthorizedClient()
    const distribution = await distributeDrawPrizes(supabase, parsed.data.drawId)
    await publishDraw(supabase, parsed.data.drawId)
    await sendDrawResultNotifications(supabase, parsed.data.drawId).catch(() => undefined)

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Draw executed and published successfully.",
      summary: {
        drawId: distribution.drawId,
        tier5Winners: distribution.tier5Winners,
        tier4Winners: distribution.tier4Winners,
        tier3Winners: distribution.tier3Winners,
        totalPool: distribution.totalPool,
        rolloverCarryIn: distribution.rolloverCarryIn,
        jackpotRolledOver: distribution.jackpotRolledOver,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to execute draw" }
  }
}
