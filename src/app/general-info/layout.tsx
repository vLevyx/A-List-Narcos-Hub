import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'General Information - A-List Hub',
  description: 'Complete information hub for Narcos Life - License prices, store prices, vehicle shop, fish trader, and more essential game data.',
  keywords: 'narcos life, general information, license prices, store prices, vehicle shop, fish trader, game guide, pricing guide',
  openGraph: {
    title: 'General Information - A-List Hub',
    description: 'Complete information hub for Narcos Life - All essential game data in one place',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'General Information - A-List Hub',
    description: 'Complete information hub for Narcos Life - All essential game data in one place',
  },
}

export default function GeneralInformationLayout({
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