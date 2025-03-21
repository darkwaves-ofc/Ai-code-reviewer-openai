import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Code Reviewer",
  description: "Get your code roasted by AI with sarcastic, funny, and actually useful feedback.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'