type EmailPayload = {
  to: string
  subject: string
  html: string
}

function getEmailEnv() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.NOTIFICATION_FROM_EMAIL

  return { apiKey, from }
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { apiKey, from } = getEmailEnv()

  // Keep notification hooks active in code paths, but skip hard-failing when email is not configured.
  if (!apiKey || !from) {
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Failed to send email: ${body}`)
  }
}
