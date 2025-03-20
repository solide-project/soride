import { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"

import { cn } from "@/lib/utils"

import "./globals.css"
import { NativeProviders } from "@/components/providers"
import { PROJECT_NAME } from "@/lib/core/config"

export const metadata: Metadata = {
  title: {
    default: `${PROJECT_NAME} | Soroban IDE`,
    template: `%s - ${PROJECT_NAME}`,
  },
  description: "Lightweight Soroban IDE",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

const fontSpace = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "bg-grayscale-000 font-sans antialiased",
            fontSpace.variable
          )}
        >
          <NativeProviders>
            {children}
          </NativeProviders>
        </body >
      </html >
    </>
  )
}