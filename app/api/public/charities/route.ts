import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from("charities")
      .select("id, name, description, featured, image_url")
      .order("featured", { ascending: false })
      .order("name", { ascending: true })
      .limit(6)

    if (error) {
      return NextResponse.json({ charities: [] }, { status: 200 })
    }

    return NextResponse.json({ charities: data ?? [] }, { status: 200 })
  } catch {
    return NextResponse.json({ charities: [] }, { status: 200 })
  }
}