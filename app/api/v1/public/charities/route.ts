import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase"
import { getPublicCharities } from "@/services/charityService"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const query = request.nextUrl.searchParams.get("q") ?? undefined
    const countryCode = request.nextUrl.searchParams.get("country")?.trim().toUpperCase() ?? undefined
    const featuredOnly = request.nextUrl.searchParams.get("featured") === "true"

    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "20")
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 20

    const charities = await getPublicCharities(supabase, {
      query,
      featuredOnly,
      limit,
      countryCode,
    })

    return NextResponse.json({ charities }, { status: 200 })
  } catch {
    return NextResponse.json({ charities: [] }, { status: 200 })
  }
}
