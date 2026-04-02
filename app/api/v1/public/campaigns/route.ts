import { NextRequest, NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase"
import { getPublicCampaigns } from "@/services/campaignService"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const countryCode = request.nextUrl.searchParams.get("country") ?? undefined
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "12")
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 50)) : 12

    const campaigns = await getPublicCampaigns(supabase, {
      countryCode,
      limit,
    })

    return NextResponse.json({ campaigns }, { status: 200 })
  } catch {
    return NextResponse.json({ campaigns: [] }, { status: 200 })
  }
}
