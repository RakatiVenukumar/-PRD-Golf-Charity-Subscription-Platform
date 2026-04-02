export function getAdminEmails(): string[] {
  const value = process.env.ADMIN_EMAILS ?? ""

  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}

export function getPostLoginRedirectPath(email: string | null | undefined): string {
  return isAdminEmail(email) ? "/admin" : "/dashboard"
}
