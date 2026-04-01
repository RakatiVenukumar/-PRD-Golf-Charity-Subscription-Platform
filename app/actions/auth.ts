"use server"

import { z } from "zod"

import { createSupabaseServerClient } from "@/lib/supabase"

type AuthActionResult = {
  success: boolean
  error?: string
}

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signupAction(input: z.infer<typeof signupSchema>): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()
  const { name, email, password } = parsed.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function loginAction(input: z.infer<typeof loginSchema>): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function logoutAction(): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
