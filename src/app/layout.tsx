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
  description: 'Everything you need for Narcos Life - Crafting Calculator, Price Planner, Weapon Compatibility, and more premium tools.',
  keywords: 'Narcos Life, gaming tools, crafting calculator, price planner, weapon compatibility',
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
 
  // DISCORD-OPTIMIZED OpenGraph (1200x630 is Discord's preferred size)
  openGraph: {
    title: 'A-List Hub - Premium Narcos Life Tools',
    description: 'Everything you need for Narcos Life - Crafting Calculator, Price Planner, Weapon Compatibility, and more premium tools.',
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com', // Replace with your actual domain
    siteName: 'A-List Hub',
    images: [
      {
        url: '/ALIST-HUB-NARCOS.png', // Use your existing high-quality image
        width: 1200,
        height: 630,
        alt: 'A-List Hub - Premium Narcos Life Tools',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png', // Fallback
        width: 512,
        height: 512,
        alt: 'A-List Hub Logo',
        type: 'image/png',
      },
    ],
  },
 
  // Discord also reads Twitter meta tags as fallback
  twitter: {
    card: 'summary_large_image',
    site: '@AListHub', // Replace with your Twitter handle if you have one
    creator: '@AListHub',
    title: 'A-List Hub - Premium Narcos Life Tools',
    description: 'Everything you need for Narcos Life - Crafting Calculator, Price Planner, Weapon Compatibility, and more premium tools.',
    images: {
      url: '/ALIST-HUB-NARCOS.png',
      alt: 'A-List Hub - Premium Narcos Life Tools',
    },
  },
 
  robots: {
    index: true,
    follow: true,
  },

  // Additional metadata for better SEO and social sharing
  category: 'Gaming Tools',
  applicationName: 'A-List Hub',
  
  // Additional tags that Discord and other platforms use
  other: {
    // Discord-specific optimization
    'theme-color': '#121212',
    // Prevent Discord from caching old images
    'og:image:secure_url': '/ALIST-HUB-NARCOS.png',
    // Additional social media optimization
    'og:image:type': 'image/png',
    'og:image:width': '1200',
    'og:image:height': '630',
  },
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
       
        {/* Preload critical favicon for faster loading */}
        <link rel="preload" href="/favicon-32x32.png" as="image" type="image/png" />
        
        {/* CRITICAL: Preload OpenGraph image for Discord */}
        <link rel="preload" href="/ALIST-HUB-NARCOS.png" as="image" type="image/png" />
        
        {/* Additional Discord optimization meta tags */}
        <meta property="og:image:secure_url" content="/ALIST-HUB-NARCOS.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Prevent caching issues - add timestamp if needed during development */}
        <meta property="og:updated_time" content={new Date().toISOString()} />
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