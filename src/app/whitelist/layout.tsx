import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Whitelist - A-List Hub',
  description: 'Complete pricing guide for all stores in Narcos Life - Find the best deals and optimize your purchases.',
  keywords: 'narcos life, store prices, pricing guide, shopping, deals, marketplace',
  openGraph: {
    title: 'Store Prices - A-List Hub',
    description: 'Complete pricing guide for all stores in Narcos Life',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Store Prices - A-List Hub',
    description: 'Complete pricing guide for all stores in Narcos Life',
  },
}

export default function StorePricesLayout({
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