import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'License Prices - A-List Hub',
  description: 'Complete guide to all license prices in Narcos Life - Vehicle licenses, business permits, and more.',
  keywords: 'narcos life, license prices, permits, vehicle licenses, business licenses, costs',
  openGraph: {
    title: 'License Prices - A-List Hub',
    description: 'Complete guide to all license prices in Narcos Life',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'License Prices - A-List Hub',
    description: 'Complete guide to all license prices in Narcos Life',
  },
}

export default function LicensePricesLayout({
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