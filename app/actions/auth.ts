"use server"

import { z } from "zod"

import { getPostLoginRedirectPath, isAdminEmail } from "@/lib/admin"
import { createSupabaseServerClient } from "@/lib/supabase"
import { sendWelcomeNotification } from "@/services/notificationService"

type AuthActionResult = {
  success: boolean
  error?: string
  message?: string
  requiresEmailConfirmation?: boolean
  redirectTo?: string
}

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  charityId: z.union([z.uuid(), z.literal(""), z.null()]).transform((value) => (value ? value : null)),
  charityPercentage: z
    .number({ message: "Charity percentage is required" })
    .min(10, "Charity percentage must be at least 10%")
    .max(100, "Charity percentage cannot exceed 100%"),
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signupAction(input: z.infer<typeof signupSchema>): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const { name, email, password, charityId, charityPercentage } = parsed.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        charity_id: charityId,
        charity_percentage: charityPercentage,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.session) {
    await sendWelcomeNotification(email, name).catch(() => undefined)
    return {
      success: true,
      requiresEmailConfirmation: true,
      message: "Account created. Check your inbox to confirm your email before signing in.",
    }
  }

  await sendWelcomeNotification(email, name).catch(() => undefined)

  return { success: true }
}

export async function loginAction(input: z.infer<typeof loginSchema>): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  if (isAdminEmail(parsed.data.email)) {
    return { success: false, error: "Admin accounts must sign in at /admin" }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    success: true,
    redirectTo: getPostLoginRedirectPath(user?.email ?? parsed.data.email),
  }
}

export async function adminLoginAction(input: z.infer<typeof loginSchema>): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  if (!isAdminEmail(parsed.data.email)) {
    return { success: false, error: "Use the user sign-in page at /login" }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, redirectTo: "/admin" }
}

export async function logoutAction(): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
