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
  title: 'A-List Hub',
  description: 'Everything you need for Narcos Life - Crafting Calculator and more premium tools.',
  keywords: 'Narcos Life, gaming tools, crafting calculator',
  authors: [{ name: 'Levy' }],
  creator: 'The A-List Team',
 
  icons: {
    // Primary favicon with multiple sizes for optimal performance
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }, // Fallback ICO
    ],
   
    // Apple touch icons for iOS home screen
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
   
    // Shortcut for older browsers
    shortcut: '/favicon.ico',
  },

  // Web App Manifest for PWA capabilities and better mobile experience
  manifest: '/site.webmanifest',
 
  // Enhanced OpenGraph with proper images
  openGraph: {
    title: 'A-List Hub',
    description: 'Premium gaming tools for Narcos Life players',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'A-List Hub Logo',
      },
    ],
  },
 
  // Enhanced Twitter/X metadata
  twitter: {
    card: 'summary_large_image',
    title: 'A-List Hub',
    description: 'Premium gaming tools for Narcos Life players',
    images: ['/android-chrome-512x512.png'],
  },
 
  robots: {
    index: true,
    follow: true,
  },

  // Additional metadata for better SEO
  category: 'Gaming Tools',
  applicationName: 'A-List Hub',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#121212',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
       
        {/* Optional: Preload critical favicon for faster loading */}
        <link rel="preload" href="/favicon-32x32.png" as="image" type="image/png" />
      </head>
      <body
        className={`${outfit.className} min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary`}
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