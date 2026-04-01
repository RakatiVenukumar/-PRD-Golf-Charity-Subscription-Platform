"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { saveWinnerProofAction } from "@/app/actions/winner-proof"
import { createSupabaseBrowserClient } from "@/lib/supabase"

type WinnerForProof = {
  id: string
  match_count: number
  prize_amount: number
  status: "pending" | "approved" | "paid" | "rejected"
  proof_url: string | null
  draw_date: string
}

type WinnerProofUploaderProps = {
  userId: string
  winners: WinnerForProof[]
}

const PROOF_BUCKET = process.env.NEXT_PUBLIC_WINNER_PROOF_BUCKET ?? "winner-proofs"

function buildProofPath(userId: string, winnerId: string, fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "png"
  const safeExtension = (extension ?? "png").toLowerCase()
  const timestamp = Date.now()
  return `${userId}/${winnerId}-${timestamp}.${safeExtension}`
}

export function WinnerProofUploader({ userId, winners }: WinnerProofUploaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeWinnerId, setActiveWinnerId] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const handleUpload = (winnerId: string, file: File | null) => {
    if (!file) {
      setError("Please select an image file first.")
      return
    }

    setError(null)
    setMessage(null)
    setActiveWinnerId(winnerId)

    startTransition(async () => {
      const proofPath = buildProofPath(userId, winnerId, file.name)

      const { error: uploadError } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(proofPath, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) {
        setError(uploadError.message)
        setActiveWinnerId(null)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(PROOF_BUCKET).getPublicUrl(proofPath)

      const result = await saveWinnerProofAction({
        winnerId,
        proofUrl: publicUrl,
      })

      if (!result.success) {
        setError(result.error ?? "Failed to save proof URL")
        setActiveWinnerId(null)
        return
      }

      setMessage("Proof uploaded successfully. Awaiting admin verification.")
      router.refresh()
      setActiveWinnerId(null)
    })
  }

  if (winners.length === 0) {
    return <p className="text-sm text-slate-600">No winner records yet. Once you win a draw, proof upload will appear here.</p>
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {winners.map((winner) => {
        const canUpload = winner.status !== "paid"
        const isUploading = isPending && activeWinnerId === winner.id

        return (
          <article key={winner.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {winner.match_count}-match winner • ${winner.prize_amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-600">Draw date: {winner.draw_date}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status: {winner.status}</p>
              </div>
              {winner.proof_url ? (
                <a
                  href={winner.proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-slate-900 underline"
                >
                  View current proof
                </a>
              ) : null}
            </div>

            {canUpload ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="block text-xs text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-slate-900 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white"
                  onChange={(event) => handleUpload(winner.id, event.target.files?.[0] ?? null)}
                  disabled={isUploading}
                />
                <span className="text-xs text-slate-500">{isUploading ? "Uploading proof..." : "Upload PNG/JPG/WebP screenshot"}</span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Proof upload closed after payout completion.</p>
            )}
          </article>
        )
      })}
    </div>
  )
}
