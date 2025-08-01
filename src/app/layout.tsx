import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

// ✅ NEW: Separate viewport export (this fixes the warning)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Better for accessibility compliance
}

// ✅ UPDATED: Clean metadata without viewport property
export const metadata: Metadata = {
  title: 'A-List Narcos Hub | Premium Tools & Services',
  description: 'Premium tools and services for narcos operations - secure, reliable, and efficient.',
  keywords: 'narcos, tools, premium, secure, reliable',
  authors: [{ name: 'A-List Team' }],
  robots: 'index, follow',
  // ❌ REMOVED: viewport property (this was causing the warning)
  
  // 🚀 BONUS: Enhanced SEO metadata for better Lighthouse scores
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'A-List Narcos Hub | Premium Tools & Services',
    description: 'Premium tools and services for narcos operations - secure, reliable, and efficient.',
    siteName: 'A-List Narcos Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-List Narcos Hub | Premium Tools & Services',
    description: 'Premium tools and services for narcos operations - secure, reliable, and efficient.',
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-background-primary text-text-primary min-h-screen flex flex-col antialiased`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}