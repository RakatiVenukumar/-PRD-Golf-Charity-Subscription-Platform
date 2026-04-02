import { sendEmail } from "@/lib/email"

type SupabaseServerClient = Awaited<ReturnType<typeof import("@/lib/supabase").createSupabaseServerClient>>

export async function sendWelcomeNotification(email: string, name: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Welcome to Digital Heroes",
    html: `
      <h2>Welcome, ${name}</h2>
      <p>Your account is ready. Choose your charity contribution and start participating in monthly draws.</p>
      <p>You can track subscription status, draw activity, and winnings from your dashboard.</p>
    `,
  })
}

export async function sendDrawResultNotifications(
  supabase: SupabaseServerClient,
  drawId: string,
): Promise<void> {
  const { data: draw, error: drawError } = await supabase
    .from("draws")
    .select("draw_date, draw_numbers")
    .eq("id", drawId)
    .single()

  if (drawError || !draw) {
    throw new Error(drawError?.message ?? "Draw not found for notifications")
  }

  const { data: activeProfiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name")
    .eq("subscription_status", "active")

  if (profileError) {
    throw new Error(profileError.message)
  }

  const { data: winnerRows, error: winnerError } = await supabase
    .from("winners")
    .select("user_id, match_count, prize_amount")
    .eq("draw_id", drawId)

  if (winnerError) {
    throw new Error(winnerError.message)
  }

  const winnerMap = new Map(
    (winnerRows ?? []).map((winner) => [winner.user_id, winner]),
  )

  await Promise.all(
    (activeProfiles ?? []).map(async (profile) => {
      const winner = winnerMap.get(profile.id)

      if (winner) {
        await sendEmail({
          to: profile.email,
          subject: "You have a winning result",
          html: `
            <h2>Congratulations ${profile.name}</h2>
            <p>You matched ${winner.match_count} numbers in the ${draw.draw_date} draw.</p>
            <p>Your provisional prize amount is $${Number(winner.prize_amount).toFixed(2)}. Upload proof in your dashboard for verification.</p>
          `,
        })
        return
      }

      await sendEmail({
        to: profile.email,
        subject: "Monthly draw results published",
        html: `
          <h2>Draw results are live</h2>
          <p>The ${draw.draw_date} draw has been published.</p>
          <p>Winning numbers: ${draw.draw_numbers.join(", ")}.</p>
          <p>Check your dashboard for participation and winnings status updates.</p>
        `,
      })
    }),
  )
}

export async function sendWinnerStatusNotification(
  email: string,
  name: string,
  status: "approved" | "rejected" | "paid",
  prizeAmount: number,
): Promise<void> {
  const statusCopy: Record<typeof status, string> = {
    approved: "Your winner submission has been approved.",
    rejected: "Your winner submission was rejected. Please review and resubmit if applicable.",
    paid: "Your payout has been completed.",
  }

  await sendEmail({
    to: email,
    subject: `Winner status update: ${status}`,
    html: `
      <h2>Hello ${name}</h2>
      <p>${statusCopy[status]}</p>
      <p>Prize amount: $${Number(prizeAmount).toFixed(2)}</p>
      <p>Visit your dashboard for full status details.</p>
    `,
  })
}
