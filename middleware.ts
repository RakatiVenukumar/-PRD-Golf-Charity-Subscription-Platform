import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getPostLoginRedirectPath, isAdminEmail } from "@/lib/admin"

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}

export async function middleware(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto")
  if (process.env.NODE_ENV === "production" && proto === "http") {
    const secureUrl = request.nextUrl.clone()
    secureUrl.protocol = "https"
    return NextResponse.redirect(secureUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/admin/login")
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isAdminRoute = pathname.startsWith("/admin")

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isProtectedRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, renewal_date")
      .eq("id", user.id)
      .maybeSingle()

    const today = new Date().toISOString().split("T")[0]

    if (
      profile?.subscription_status === "active" &&
      profile.renewal_date &&
      profile.renewal_date < today
    ) {
      await supabase
        .from("profiles")
        .update({ subscription_status: "lapsed" })
        .eq("id", user.id)
    }
  }

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = getPostLoginRedirectPath(user.email)
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminRoute && user && !isAdminEmail(user.email)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
}
