// app/server-status/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Narcos Life Server Status | Live Server Information',
  description: 'Real-time server status for Narcos Life Arma Reforger server. Check player count, server status, and connection information.',
  keywords: 'narcos life, arma reforger, server status, players online, battlemetrics',
  openGraph: {
    title: 'Narcos Life Server Status',
    description: 'Live server information and player statistics',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ServerStatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}