import type { Tables } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

type CountryRow = Tables<"countries">

type PlatformConfig = {
  locale: {
    defaultCountryCode: string
    supportedCountries: CountryRow[]
  }
  modules: {
    campaigns: {
      ready: boolean
      active: boolean
    }
    organizations: {
      ready: boolean
      active: boolean
    }
  }
}

export async function getSupportedCountries(supabase: SupabaseServerClient): Promise<CountryRow[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getPublicPlatformConfig(supabase: SupabaseServerClient): Promise<PlatformConfig> {
  const countries = await getSupportedCountries(supabase)

  const defaultCountryCode = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE?.trim().toUpperCase() || "US"

  return {
    locale: {
      defaultCountryCode,
      supportedCountries: countries,
    },
    modules: {
      campaigns: {
        ready: true,
        active: process.env.NEXT_PUBLIC_CAMPAIGNS_ACTIVE === "true",
      },
      organizations: {
        ready: true,
        active: process.env.NEXT_PUBLIC_ORGANIZATIONS_ACTIVE === "true",
      },
    },
  }
}
