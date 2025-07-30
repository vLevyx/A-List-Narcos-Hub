import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

// Enhanced Outfit font configuration with more weights and better loading
const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'A-List Narcos Hub',
  description: 'Premium tools and services for narcos operations - secure, reliable, and efficient.',
  keywords: 'narcos, gaming tools, secure operations, premium services',
  authors: [{ name: 'The A-List Team' }],
  creator: 'The A-List Team',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'A-List Narcos Hub',
    description: 'Premium tools and services for narcos operations',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-List Narcos Hub',
    description: 'Premium tools and services for narcos operations',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ff6b00',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${outfit.className}`} suppressHydrationWarning>
      <head>
        {/* Enhanced font preloading */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Explicit Outfit font import as backup */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body 
        className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary"
        style={{ 
          fontFamily: 'var(--font-outfit), Outfit, system-ui, sans-serif'
        }}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}