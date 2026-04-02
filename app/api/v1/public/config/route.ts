import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase"
import { getPublicPlatformConfig } from "@/services/platformConfigService"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const config = await getPublicPlatformConfig(supabase)

    return NextResponse.json({ config }, { status: 200 })
  } catch {
    return NextResponse.json(
      {
        config: {
          locale: {
            defaultCountryCode: "US",
            supportedCountries: [],
          },
          modules: {
            campaigns: { ready: true, active: false },
            organizations: { ready: true, active: false },
          },
        },
      },
      { status: 200 },
    )
  }
}
