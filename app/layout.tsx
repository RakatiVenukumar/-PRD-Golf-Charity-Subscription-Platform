import type { Metadata } from "next"
import { IBM_Plex_Mono, Space_Grotesk, Syne } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Digital Heroes | Impact Subscription Platform",
  description: "Support verified charities through a modern subscription platform with transparent monthly rewards and impact tracking.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${syne.variable} ${ibmPlexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
