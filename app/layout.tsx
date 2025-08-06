import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ExploraSaquá - Guia de Saquarema",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ExploraSaquá - Guia de Saquarema",
    description: "Descubra os melhores lugares de Saquarema com nosso guia completo para moradores e visitantes",
    url: "https://explora-saqua.vercel.app/",
    siteName: "ExploraSaquá",
    images: [
      {
        url: "/logo2sq.png",
        width: 1200,
        height: 630,
        alt: "ExploraSaquá Logo",
      },
    ],
    type: "website",
  },
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
