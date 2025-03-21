import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import "@/app/globals.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Code Reviewer",
  description: "Get your code roasted by AI with sarcastic, funny, and actually useful feedback.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header session={session} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
