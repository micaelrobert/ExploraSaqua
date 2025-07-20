import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ExploraSaquá - Guia de Saquarema",
  icons: {
    icon: "/favicon.ico",
  },
  description: "Descubra os melhores lugares de Saquarema com nosso guia completo para moradores e visitantes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
